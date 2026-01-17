
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const AdmZip = require('adm-zip'); // Added for ZIP handling
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---

// --- CONFIGURATION ---
const BATCH_SIZE = 500;
const ZIP_FILE = path.resolve(__dirname, '../database/avall.zip');
const EXTRACT_PATH = path.resolve(__dirname, '../database/ntsb_data');

if (!fs.existsSync(ZIP_FILE)) {
    console.error(`❌ NTSB Zip file not found at: ${ZIP_FILE}`);
    console.error("Please download 'avall.zip' from NTSB and place it in the database folder.");
    process.exit(1);
}

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractAndProcess() {
    console.log(`📦 Reading Zip in Memory: ${ZIP_FILE}...`);
    const zip = new AdmZip(ZIP_FILE);

    // Check for aircraft.txt entry
    const zipEntries = zip.getEntries();
    const aircraftEntry = zipEntries.find(entry => entry.entryName === 'aircraft.txt' || entry.entryName === 'AIRCRAFT.txt');

    if (!aircraftEntry) {
        console.error("❌ Could not find 'aircraft.txt' inside the zip.");
        console.log("Available files:", zipEntries.map(e => e.entryName).join(', '));
        return;
    }

    console.log(`📖 Parsing Aircraft Data from Memory (${(aircraftEntry.header.size / 1024 / 1024).toFixed(2)} MB)...`);

    // Read raw text content
    const rawText = zip.readAsText(aircraftEntry);

    // Parse the TSV/Pipe content manually or using a lightweight parser
    // Since we have the full string, simpler to split by newline for memory safety if using a stream isn't easy with AdmZip buffers
    // But csv-parser expects a stream. We can create a readable stream from the string.

    const stream = Readable.from(rawText).pipe(csv({ separator: '\t' }));

    let records = [];
    let totalInserted = 0;

    for await (const row of stream) {
        // NTSB Columns: ev_id, Aircraft_Key, reg_nrb (Tail Number)
        const ev_id = row['ev_id'];
        let n_number = row['reg_nrb']; // Tail number

        if (!n_number || !ev_id) continue;

        // Clean N-Number
        n_number = n_number.trim().toUpperCase();
        if (!n_number.startsWith('N') && /^[0-9]/.test(n_number)) {
            n_number = 'N' + n_number;
        }

        const record = {
            n_number: n_number,
            event_id: ev_id,
            event_date: row['ev_date'] || new Date().toISOString(), // This might need joining with events.txt in full version
            // For MVP, we use the aircraft file's limited data or placeholder
            // Note: Real NTSB structure requires joining 'events.txt' for date/city. 
            // We will do a simplified ingestion of just the index first.
            event_type: 'Accident/Incident', // Simplified
            city: '', // would need join
            state: '', // would need join
            damage: row['damage'] || 'Unknown',
            narrative: `NTSB Event ID: ${ev_id}. Damage: ${row['damage'] || 'Unknown'}`
        };

        records.push(record);

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🇺🇸 Imported: ${totalInserted.toLocaleString()} NTSB records`);
            records = [];
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ NTSB SYNC COMPLETE! Total records: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('forensic_ntsb')
        .insert(batch);

    if (error) {
        console.error('\n❌ Insert Error:', error.message);
    }
}

extractAndProcess().catch(err => console.error(err));
