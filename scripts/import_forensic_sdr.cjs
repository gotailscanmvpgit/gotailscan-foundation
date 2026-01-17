
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const BATCH_SIZE = 500;
const CSV_FILE = process.argv[2]; // Pass file path as argument

if (!CSV_FILE) {
    console.error("❌ Please provide a path to the SDR CSV file.");
    console.log("Usage: node scripts/import_forensic_sdr.cjs ./path/to/sdr_data.csv");
    process.exit(1);
}

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function processCSV() {
    console.log(`📖 Reading SDR CSV: ${CSV_FILE}`);

    if (!fs.existsSync(CSV_FILE)) {
        throw new Error("File not found!");
    }

    let records = [];
    let count = 0;
    let totalInserted = 0;

    const stream = fs.createReadStream(CSV_FILE)
        .pipe(csv()); // Assumes CSV has headers matching keys or we map them

    for await (const row of stream) {
        // Map CSV columns to our Supabase Table columns
        // This mapping depends on the exact FAA SDR export format.
        // Example Mapping (Adjust based on your CSV):
        const record = {
            n_number: row['N-Number'] ? (row['N-Number'].startsWith('N') ? row['N-Number'] : 'N' + row['N-Number']) : null,
            report_date: row['Report Date'] || null,
            control_number: row['Control Number'] || null,
            part_name: row['Part Name'] || row['Component'] || null,
            description: row['Description'] || row['Narrative'] || null,
            nature_of_condition: row['Nature of Condition'] || null
        };

        if (!record.n_number) continue;

        records.push(record);
        count++;

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🚀 Processed: ${totalInserted.toLocaleString()} SDR records`);
            records = [];
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ DONE! Total imported: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('forensic_sdr')
        .insert(batch); // Using insert here as SDRs are distinct events

    if (error) {
        console.error('\n❌ Insert Error:', error.message);
    }
}

processCSV().catch(err => console.error(err));
