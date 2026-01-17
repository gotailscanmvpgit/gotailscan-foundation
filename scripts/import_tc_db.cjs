
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const ZIP_FILE_NAME = 'CCAR_CS_data.zip';
const EXTRACT_FOLDER_NAME = 'tc_data';
const DATABASE_DIR = path.resolve(__dirname, '../database');
const DOWNLOAD_PATH = path.join(DATABASE_DIR, ZIP_FILE_NAME);
const EXTRACT_PATH = path.join(DATABASE_DIR, EXTRACT_FOLDER_NAME);
const BATCH_SIZE = 1000;

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractFile() {
    if (!fs.existsSync(DOWNLOAD_PATH)) {
        throw new Error(`❌ File not found: ${DOWNLOAD_PATH}. Please ensure it is present in the database folder.`);
    }

    if (!fs.existsSync(EXTRACT_PATH)) {
        fs.mkdirSync(EXTRACT_PATH, { recursive: true });
    }

    console.log(`📦 Extracting ${ZIP_FILE_NAME}...`);
    const zip = new AdmZip(DOWNLOAD_PATH);
    zip.extractAllTo(EXTRACT_PATH, true);
    console.log(`✅ Extracted to ${EXTRACT_PATH}`);
}

async function getOwnersMap() {
    const ownerFile = path.join(EXTRACT_PATH, 'carsownr.txt');
    if (!fs.existsSync(ownerFile)) {
        console.warn("⚠️  carsownr.txt not found. Owner names will be missing.");
        return new Map();
    }

    console.log("👥 Building Ownership Index...");
    const owners = new Map();
    const stream = fs.createReadStream(ownerFile).pipe(csv({ headers: false }));

    for await (const row of stream) {
        const mark = row[0]?.trim();
        if (!mark) continue;
        owners.set(mark, {
            name: row[1]?.trim(),
            street: row[3]?.trim(),
            city: row[5]?.trim(),
            state: row[6]?.trim(),
            zip: row[8]?.trim()
        });
    }
    console.log(`✅ Indexed ${owners.size} owner records.`);
    return owners;
}

async function processRegistry() {
    const aircraftFile = path.join(EXTRACT_PATH, 'carscurr.txt');
    if (!fs.existsSync(aircraftFile)) {
        throw new Error("❌ Could not find main aircraft registry file: carscurr.txt");
    }

    const ownersMap = await getOwnersMap();
    console.log(`📖 Processing Registry: ${aircraftFile}`);

    let records = [];
    let totalInserted = 0;

    const stream = fs.createReadStream(aircraftFile).pipe(csv({ headers: false }));

    for await (const row of stream) {
        const mark = row[0]?.trim();
        if (!mark) continue;

        const tail = `C-${mark}`;
        const owner = ownersMap.get(mark) || {};

        const record = {
            n_number: tail,
            serial_number: row[5]?.trim(),
            mfr_mdl_code: row[3]?.trim(), // Manufacturer
            kit_model: row[4]?.trim(),    // Model
            year_mfr: row[31]?.split('/')[0]?.trim(), // Extraction from YYYY/MM/DD
            name: owner.name || 'PRIVATE OWNER',
            street: owner.street || '',
            city: owner.city || '',
            state: owner.state || '',
            zip_code: owner.zip || '',
            country: 'CANADA',
            region: 'Transport Canada'
        };

        records.push(record);

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🇨🇦 Ingested: ${totalInserted.toLocaleString()} Canadian aircraft`);
            records = [];
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ MISSION COMPLETE! Total records: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('aircraft_registry')
        .upsert(batch, { onConflict: 'n_number' });

    if (error) {
        console.error('\n❌ Ingestion Error:', error.message);
    }
}

async function main() {
    try {
        await extractFile();
        await processRegistry();
    } catch (err) {
        console.error("\n💥 SYSTEM FAILURE:", err.message);
    }
}

main();
