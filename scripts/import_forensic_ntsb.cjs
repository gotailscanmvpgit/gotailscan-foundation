
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const AdmZip = require('adm-zip'); // Added for ZIP handling
const { Readable } = require('stream'); // Added for stream handling
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---

// --- CONFIGURATION ---
const BATCH_SIZE = 500;
const ZIP_FILE = path.resolve(__dirname, '../database/avall.zip');
// const EXTRACT_PATH = path.resolve(__dirname, '../database/ntsb_data'); // Not used for in-memory

if (!fs.existsSync(ZIP_FILE)) {
    console.error(`❌ NTSB Zip file not found at: ${ZIP_FILE}`);
    console.error("Please download 'avall.zip' from NTSB and place it in the database folder.");
    process.exit(1);
}

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractAndProcess() {
    console.log(`📦 Reading Zip in Memory: ${ZIP_FILE}...`);
    const zip = new AdmZip(ZIP_FILE);
    const zipEntries = zip.getEntries();

    // 1. Check for avall.mdb (Access Database) - Preferred for full schema
    const mdbEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.mdb'));

    if (mdbEntry) {
        await processMDB(zip, mdbEntry);
    } else {
        // 2. Fallback to Text Files
        const aircraftEntry = zipEntries.find(entry => entry.entryName === 'aircraft.txt' || entry.entryName === 'AIRCRAFT.txt');
        if (aircraftEntry) {
            await processTextFiles(zip, aircraftEntry);
        } else {
            console.error("❌ Could not find 'avall.mdb' or 'aircraft.txt' inside the zip.");
            console.log("Available files:", zipEntries.map(e => e.entryName).join(', '));
            return;
        }
    }
}

async function processMDB(zip, mdbEntry) {
    console.log(`P Parsing MDB Database (${(mdbEntry.header.size / 1024 / 1024).toFixed(2)} MB)...`);

    // Lazy load mdb-reader to avoid crash if not installed
    let MDBReader;
    try {
        MDBReader = require('mdb-reader').default;
    } catch (e) {
        console.error("❌ 'mdb-reader' not found. Please run: npm install mdb-reader");
        process.exit(1);
    }

    const buffer = zip.readFile(mdbEntry);
    const reader = new MDBReader(buffer);

    // Get Table Names
    const tableNames = reader.getTableNames();
    console.log("Found Tables:", tableNames.join(', '));

    // 1. Load Events to get Dates (ev_id -> { date, city })
    const eventParams = {};
    const eventTableName = tableNames.find(t => t.toLowerCase() === 'events' || t.toLowerCase() === 'event');

    if (eventTableName) {
        console.log(`Reading Events table: ${eventTableName}...`);
        const eventTable = reader.getTable(eventTableName);
        const eventRows = eventTable.getData();

        eventRows.forEach(row => {
            // Keys are likely lowercase or uppercase depending on MDB version. normalizing.
            // Helper to get case-insensitive prop
            const get = (obj, key) => obj[Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())];

            const id = get(row, 'ev_id');
            if (id) {
                eventParams[id] = {
                    date: get(row, 'ev_date'),
                    city: get(row, 'ev_city'),
                    state: get(row, 'ev_state')
                };
            }
        });
        console.log(`Loaded ${Object.keys(eventParams).length} events.`);
    }

    // 2. Load Aircraft
    const aircraftTableName = tableNames.find(t => t.toLowerCase() === 'aircraft');
    if (!aircraftTableName) {
        console.error("❌ 'aircraft' table not found in MDB.");
        return;
    }

    console.log(`Reading Aircraft table: ${aircraftTableName}...`);
    const aircraftTable = reader.getTable(aircraftTableName);
    const aircraftRows = aircraftTable.getData();

    console.log(`Processing ${aircraftRows.length} aircraft records...`);
    if (aircraftRows.length > 0) {
        console.log("Sample Row Keys:", Object.keys(aircraftRows[0]));
        console.log("Sample Row:", aircraftRows[0]);
    }

    let records = [];
    let totalInserted = 0;

    for (const row of aircraftRows) {
        const get = (obj, key) => obj[Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase())];

        const ev_id = get(row, 'ev_id');
        // MDB uses 'regis_no', Text uses 'reg_nrb'
        let n_number = get(row, 'regis_no') || get(row, 'reg_nrb');

        if (!n_number || !ev_id) continue;

        // Clean N-Number
        n_number = n_number.trim().toUpperCase();
        if (!n_number.startsWith('N') && /^[0-9]/.test(n_number)) {
            n_number = 'N' + n_number;
        }

        // Join with Event
        const evt = eventParams[ev_id] || {};

        const record = {
            n_number: n_number,
            event_id: ev_id,
            event_date: evt.date || new Date().toISOString(),
            event_type: 'Accident/Incident',
            location_city: evt.city || '',
            location_state: evt.state || '',
            aircraft_damage: get(row, 'damage') || 'Unknown',
            narrative: `NTSB Event: ${ev_id}. Damage: ${get(row, 'damage') || 'Unknown'}`,
            acft_make: get(row, 'acft_make') || '',
            acft_model: get(row, 'acft_model') || ''
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

async function processTextFiles(zip, aircraftEntry) {
    console.log(`📖 Parsing Aircraft Data from Memory (${(aircraftEntry.header.size / 1024 / 1024).toFixed(2)} MB)...`);
    const rawText = zip.readAsText(aircraftEntry);
    const stream = Readable.from(rawText).pipe(csv({ separator: '\t' }));

    let records = [];
    let totalInserted = 0;

    for await (const row of stream) {
        const ev_id = row['ev_id'];
        let n_number = row['reg_nrb'];

        if (!n_number || !ev_id) continue;

        n_number = n_number.trim().toUpperCase();
        if (!n_number.startsWith('N') && /^[0-9]/.test(n_number)) {
            n_number = 'N' + n_number;
        }

        const record = {
            n_number: n_number,
            event_id: ev_id,
            event_date: row['ev_date'] || new Date().toISOString(),
            event_type: 'Accident/Incident',
            city: '',
            state: '',
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
        // console.error('\n❌ Insert Error:', error.message);
        // Duplicate key errors are expected if re-running
    }
}

extractAndProcess().catch(err => console.error(err));
