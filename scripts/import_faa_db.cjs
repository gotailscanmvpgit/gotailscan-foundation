
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const FAA_ZIP_URL = 'https://registry.faa.gov/database/ReleasableAircraft.zip';
// const FAA_ZIP_URL = 'http://registry.faa.gov/database/ReleasableAircraft.zip'; // Sometimes http is more reliable for old gov sites
const DOWNLOAD_PATH = path.resolve(__dirname, '../database/ReleasableAircraft.zip');
const EXTRACT_PATH = path.resolve(__dirname, '../database/faa_data');
const BATCH_SIZE = 1000;

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// MUST use Service Role Key for large writes to bypass RLS policies if necessary, 
// but Anon key might work if RLS allows inserts. 
// For admin scripts, Service Role is better.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadFile() {
    console.log(`⬇️  Downloading FAA Database from ${FAA_ZIP_URL}...`);
    const writer = fs.createWriteStream(DOWNLOAD_PATH);

    const response = await axios({
        url: FAA_ZIP_URL,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function extractFile() {
    console.log(`📦 Extracting ${DOWNLOAD_PATH}...`);
    const zip = new AdmZip(DOWNLOAD_PATH);
    zip.extractAllTo(EXTRACT_PATH, true);
    console.log(`✅ Extracted to ${EXTRACT_PATH}`);
}

async function processCSV() {
    const csvFilePath = path.join(EXTRACT_PATH, 'MASTER.txt');
    console.log(`📖 Reading CSV: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
        throw new Error("MASTER.txt not found inside zip!");
    }

    let records = [];
    let count = 0;
    let totalInserted = 0;

    const stream = fs.createReadStream(csvFilePath)
        .pipe(csv({
            separator: ',', // FAA usually uses comma
            skipLines: 0,
            headers: [
                'N-NUMBER', 'SERIAL NUMBER', 'MFR MDL CODE', 'ENG MFR MDL', 'YEAR MFR',
                'TYPE REGISTRANT', 'NAME', 'STREET', 'STREET2', 'CITY', 'STATE', 'ZIP CODE',
                'REGION', 'COUNTY', 'COUNTRY', 'LAST ACTION DATE', 'CERT ISSUE DATE', 'CERTIFICATION',
                'TYPE AIRCRAFT', 'TYPE ENGINE', 'STATUS CODE', 'MODE S CODE', 'FRACT OWNER',
                'AIR WORTH DATE', 'OTHER NAMES(1)', 'OTHER NAMES(2)', 'OTHER NAMES(3)',
                'OTHER NAMES(4)', 'OTHER NAMES(5)', 'EXPIRATION DATE', 'UNIQUE ID',
                'KIT MFR', 'KIT MODEL', 'MODE S CODE HEX'
            ]
        }));

    for await (const row of stream) {
        if (!row['N-NUMBER']) continue;

        // Map FAA CSV columns to our Supabase Table columns
        const record = {
            n_number: 'N' + row['N-NUMBER'].trim(), // Standardize to include 'N'
            serial_number: row['SERIAL NUMBER']?.trim(),
            mfr_mdl_code: row['MFR MDL CODE']?.trim(),
            eng_mfr_mdl: row['ENG MFR MDL']?.trim(),
            year_mfr: row['YEAR MFR']?.trim(),
            type_registrant: row['TYPE REGISTRANT']?.trim(),
            name: row['NAME']?.trim(),
            street: row['STREET']?.trim(),
            city: row['CITY']?.trim(),
            state: row['STATE']?.trim(),
            zip_code: row['ZIP CODE']?.trim(),
            country: row['COUNTRY']?.trim(),
            region: row['REGION']?.trim(),
            status_code: row['STATUS CODE']?.trim(),
            kit_mfr: row['KIT MFR']?.trim(),
            kit_model: row['KIT MODEL']?.trim(),
            type_aircraft: row['TYPE AIRCRAFT']?.trim(),
            // model: '', REMOVED - Not in DB Schema
            // Note: In a full implementation, we'd also import the ACFTREF.txt file to map 'MFR MDL CODE' to actual 'Make/Model' names.
            // For now, we store the code.
        };

        records.push(record);
        count++;

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🚀 Inserted: ${totalInserted.toLocaleString()} aircraft`);
            records = [];
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ DONE! Total inserted: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('aircraft_registry')
        .upsert(batch, { onConflict: 'n_number', ignoreDuplicates: false });

    if (error) {
        console.error('\n❌ Insert Error:', error.message);
        // Don't crash, just continue
    }
}

async function main() {
    try {
        if (!fs.existsSync(DOWNLOAD_PATH)) {
            await downloadFile();
        } else {
            console.log("ℹ️  Zip file already exists, skipping download.");
        }

        await extractFile();
        await processCSV();
    } catch (err) {
        console.error("\n💥 Fatal Error:", err);
    }
}

main();
