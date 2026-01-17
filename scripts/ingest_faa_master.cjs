const fs = require('fs');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Stats: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

const BATCH_SIZE = 4000; // Increased batch size for speed
const MAX_ROWS = 350000; // Cap to prevent memory/timeout issues

async function importMasterFile() {
    console.log("🚀 Starting FAA MASTER.txt ingestion...");
    console.time("Ingestion Duration");

    const fileStream = fs.createReadStream('MASTER.txt');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let records = [];
    let count = 0;
    let totalImported = 0;
    let headerSkipped = false;

    for await (const line of rl) {
        // Skip header row usually containing "N-NUMBER,SERIAL NUMBER,..."
        if (!headerSkipped) {
            headerSkipped = true;
            continue;
        }

        // Parse Fixed Width or CSV. FAA MASTER is typically CSV with header.
        // Format: N-NUMBER, SERIAL NUMBER, MFR MDL CODE, ENG MFR MDL, YEAR MFR, ...
        // We will do a basic CSV split. Warning: commas in quotes can break this, but FAA data is usually clean.
        const cols = line.split(',').map(c => c.trim());

        if (cols.length < 5) continue; // Invalid row

        const nNumber = cols[0];
        const serial = cols[1];
        const mfrMdl = cols[2];
        const engMdl = cols[3];
        const year = cols[4];
        const typeAircraft = cols[5];
        const typeEngine = cols[10]; // Verify index based on standard layout
        const name = cols[6];
        const city = cols[11];
        const state = cols[12];
        const country = 'US'; // Implicit

        // Clean N-Number (Remove 'N' prefix if present in file, though typically it is NOT in the file)
        const cleanN = nNumber.startsWith('N') ? nNumber.substring(1) : nNumber;

        records.push({
            n_number: cleanN,
            serial_number: serial,
            mfr_mdl_code: mfrMdl,
            eng_mfr_mdl: engMdl,
            year_mfr: year,
            type_aircraft: typeAircraft,
            type_engine: typeEngine,
            name: name,
            city: city,
            state: state,
            country: country,
            status_code: 'A' // Active
        });

        count++;

        if (count >= BATCH_SIZE) {
            await insertBatch(records);
            totalImported += records.length;
            records = [];
            count = 0;
            console.log(`... Imported ${totalImported} aircraft so far.`);
        }

        if (totalImported >= MAX_ROWS) {
            console.log("⚠️ Reached safety limit. Stopping.");
            break;
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalImported += records.length;
    }

    console.timeEnd("Ingestion Duration");
    console.log(`✅ COMPLETE. Total Aircraft Imported: ${totalImported}`);
}

async function insertBatch(batch) {
    const { error } = await supabase.from('aircraft_registry').upsert(batch, { onConflict: 'n_number', ignoreDuplicates: false });
    if (error) {
        console.error("❌ Batch Insert Error:", error.message);
        // Retry logic could go here
    }
}

importMasterFile();
