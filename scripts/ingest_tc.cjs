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

const BATCH_SIZE = 4000;
const MAX_ROWS = 100000; // Canada has ~40k aircraft, this is plenty.

async function importCanadaMasterRedux() {
    // Transport Canada usually provides 'carscurr.txt' inside the zip.
    // Ensure the user has extracted 'carscurr.txt' to the scripts folder.
    const tcFile = path.resolve(__dirname, 'carscurr.txt');

    if (!fs.existsSync(tcFile)) {
        console.error("❌ Error: 'carscurr.txt' not found.");
        console.log("👉 Please download the CCAR zip from Transport Canada, unzip it, and place 'carscurr.txt' in the scripts/ folder.");
        return;
    }

    console.log("🚀 Starting Transport Canada (carscurr.txt) ingestion...");
    console.time("TC Ingestion Duration");

    const fileStream = fs.createReadStream(tcFile, { encoding: 'latin1' }); // TC often uses legacy encoding
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let records = [];
    let count = 0;
    let totalImported = 0;
    let isHeader = false; // Check if first line is header

    for await (const line of rl) {
        if (!line.trim()) continue;

        // Transport Canada format is usually CSV, but can be tricky with comma-delimited fields.
        // Expected columns (approx based on standard):
        // Mark (0), Common Mark, Model (2), Serial (3), Owner Name (4), Address... Year (varies)

        // We will assume a standard CSV split for this specific file.
        // Logic might need tweaking if they use quote-encapsulation heavily.
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        // Basic validation: Line must have at least a Mark (Col 0) and Serial (Col 3ish)
        if (cols.length < 5) continue;

        // Header Check
        if (cols[0].toUpperCase() === 'MARK' || cols[0].toUpperCase() === 'N-NUMBER') {
            continue;
        }

        const mark = cols[0]; // e.g. "F-ABC" or just "ABC" (usually C-ABC is implied or explicit)
        const model = cols[2] + " " + cols[3]; // Model + Series often split
        const serial = cols[4];
        const year = cols[13] || '2000'; // Approximate column index for Year, often further down
        const ownerName = cols[17] || 'Private Owner';
        const city = cols[21] || 'Unknown';
        const province = cols[22] || '';

        // Normalize Tail: Ensure it starts with 'C-' if it's just 4 letters
        let cleanTail = mark;
        if (!mark.includes('-') && mark.length === 4) {
            cleanTail = 'C-' + mark;
        }

        records.push({
            n_number: cleanTail,
            serial_number: serial,
            mfr_mdl_code: cols[2] || 'TC-Unknown',
            eng_mfr_mdl: cols[3] || '',
            year_mfr: year.length === 4 ? year : '1990', // Default if parse fails
            type_aircraft: '1', // Default to Fixed Wing
            type_engine: '0',
            name: ownerName,
            city: city,
            state: province,
            country: 'CA',
            status_code: 'A'
        });

        count++;

        if (count >= BATCH_SIZE) {
            await insertBatch(records);
            totalImported += records.length;
            records = [];
            count = 0;
            console.log(`... Imported ${totalImported} Canadian aircraft.`);
        }
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalImported += records.length;
    }

    console.timeEnd("TC Ingestion Duration");
    console.log(`✅ COMPLETE. Total Canadian Aircraft Imported: ${totalImported}`);
}

async function insertBatch(batch) {
    const { error } = await supabase.from('aircraft_registry').upsert(batch, { onConflict: 'n_number', ignoreDuplicates: true });
    if (error) {
        console.error("❌ Batch Insert Error:", error.message);
    }
}

importCanadaMasterRedux();
