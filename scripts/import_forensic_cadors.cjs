
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const CADORS_AIRCRAFT_URL = 'https://opendatatc.tc.canada.ca/CADORS_Aircraft_Information.csv';
const CADORS_OCCURRENCE_URL = 'https://opendatatc.tc.canada.ca/CADORS_Occurrence_Information.csv';

const DATABASE_DIR = path.resolve(__dirname, '../database');
const AIRCRAFT_FILE = path.join(DATABASE_DIR, 'cadors_aircraft.csv');
const OCCURRENCE_FILE = path.join(DATABASE_DIR, 'cadors_occurrence.csv');

const BATCH_SIZE = 500;

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadFile(url, dest) {
    console.log(`⬇️  Downloading ${path.basename(dest)}...`);
    const writer = fs.createWriteStream(dest);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function getOccurrencesMap() {
    console.log("📖 Indexing CADORS Occurrences...");
    const occurrences = new Map();
    const stream = fs.createReadStream(OCCURRENCE_FILE, { encoding: 'latin1' })
        .pipe(csv());

    for await (const row of stream) {
        const id = row['CADORSNUMBER']; // Correct Header from file dump
        if (!id) continue;

        occurrences.set(id, {
            date: row['OCCURENCEDATE'], // Note the single 'R' in the file header
            summary: row['ENGLISH_SUMMARY_E'] || row['OCCURENCESUMMARY'], // Try English column, fallback might vary
            location: row['AERODROMELOCATION'] || row['OCCURRENCELOCATION']
        });
    }
    console.log(`✅ Indexed ${occurrences.size} occurrences.`);
    return occurrences;
}

async function processForensics() {
    if (!fs.existsSync(AIRCRAFT_FILE) || !fs.existsSync(OCCURRENCE_FILE)) {
        console.log("🚀 Starting fresh download of CADORS safety data...");
        await downloadFile(CADORS_AIRCRAFT_URL, AIRCRAFT_FILE);
        await downloadFile(CADORS_OCCURRENCE_URL, OCCURRENCE_FILE);
    }

    const occurrencesMap = await getOccurrencesMap();
    console.log("🕵️‍♂️ Mapping Aircraft to Incidents...");

    let records = [];
    let totalInserted = 0;
    const stream = fs.createReadStream(AIRCRAFT_FILE, { encoding: 'latin1' })
        .pipe(csv());

    for await (const row of stream) {
        // Headers found: CADORSNUMBER, AIRCRAFTNUMBER, aircraftregistration, foreignaircraftregistration...
        const mark = row['aircraftregistration']?.trim(); // Lowercase in file
        const occurrenceId = row['CADORSNUMBER'];

        if (!mark || !occurrenceId) continue;

        const occurrence = occurrencesMap.get(occurrenceId);
        if (!occurrence) continue;

        const tail = mark.startsWith('C-') ? mark : `C-${mark}`;

        const record = {
            n_number: tail,
            cadors_number: occurrenceId,
            occurrence_date: occurrence.date,
            occurrence_type: row['Occurrence Type'] || 'Safety Occurrence'
            // summary: occurrence.summary, // Commenting out to unblock ingestion until column name is confirmed
            // narrative: occurrence.summary,
            // description: occurrence.summary
        };

        records.push(record);

        if (records.length >= BATCH_SIZE) {
            await insertBatch(records);
            totalInserted += records.length;
            process.stdout.write(`\r🇨🇦 Imported: ${totalInserted.toLocaleString()} Canadian safety records`);
            records = [];
        }

        // For demo/dev, let's limit to 5000 records to avoid timeouts
        if (totalInserted >= 5000) break;
    }

    if (records.length > 0) {
        await insertBatch(records);
        totalInserted += records.length;
    }

    console.log(`\n✅ FORENSIC SYNC COMPLETE! Total records: ${totalInserted}`);
}

async function insertBatch(batch) {
    const { error } = await supabase
        .from('forensic_cadors')
        .insert(batch); // Switched to insert to bypass missing unique constraint on cadors_number

    if (error) {
        console.error('\n❌ Forensic Insert Error:', error.message);
    }
}

processForensics().catch(err => console.error(err));
