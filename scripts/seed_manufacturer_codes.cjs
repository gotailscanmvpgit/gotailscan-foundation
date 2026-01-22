
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const ACFTREF_PATH = path.resolve(__dirname, 'ACFTREF.txt');
const BATCH_SIZE = 2000;

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Service Role Key for bulk inserts
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function processFile() {
    console.log(`📖 Reading FAA Aircraft Reference: ${ACFTREF_PATH}`);

    if (!fs.existsSync(ACFTREF_PATH)) {
        console.error(`❌ File not found: ${ACFTREF_PATH}`);
        process.exit(1);
    }

    let records = [];
    let count = 0;
    let totalInserted = 0;

    const stream = fs.createReadStream(ACFTREF_PATH)
        .pipe(csv({
            separator: ',',
            headers: [
                'CODE', 'MFR', 'MODEL', 'TYPE-ACFT', 'TYPE-ENG', 'AC-CAT',
                'BUILD-CERT-IND', 'NO-ENG', 'NO-SEATS', 'AC-WEIGHT', 'SPEED',
                'TC-DATA-SHEET', 'TC-DATA-HOLDER'
            ],
            skipLines: 1 // Skip header line if present (it is present in the file view)
        }));

    for await (const row of stream) {
        if (!row['CODE']) continue;

        const code = row['CODE'].trim();
        const mfr = row['MFR']?.trim() || '';
        const model = row['MODEL']?.trim() || '';

        let makeModel = `${mfr} ${model}`.trim();

        // Basic deduplication/cleaning can happen here if needed
        if (makeModel.length === 0) makeModel = 'UNKNOWN';

        const record = {
            code: code,
            make_model: makeModel,
            manufacturer: mfr
        };

        records.push(record);
        count++;

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🚀 Processed: ${totalInserted.toLocaleString()} codes...`);
            records = [];
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ DONE! Total codes upserted: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('manufacturer_codes')
        .upsert(batch, { onConflict: 'code', ignoreDuplicates: true }); // ignoreDuplicates: true to avoid over-writing manually curated ones if any, or just speed

    if (error) {
        // If "relation does not exist", the user didn't run the migration yet.
        if (error.code === '42P01') {
            console.error('\n❌ Table "manufacturer_codes" does not exist. Please run migration first.');
            process.exit(1);
        }
        console.error('\n❌ Insert Error:', error.message);
    }
}

processFile().catch(err => console.error("\n💥 Fatal Error:", err));
