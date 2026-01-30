
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// --- CONFIGURATION ---
const TC_ZIP_URL = 'https://wwwapps.tc.gc.ca/Saf-Sec-Sur/2/CCARCS-RIACC/download/ccarcsdb.zip';
const DB_DIR = path.resolve(__dirname, '../database');
const DOWNLOAD_PATH = path.join(DB_DIR, 'ccarcsdb.zip');
const EXTRACT_PATH = path.join(DB_DIR, 'tc_data');
const SYNC_STATE_FILE = path.join(DB_DIR, 'tc_sync_state.json');

const BATCH_SIZE = 5000;

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSyncNeeded() {
    try {
        console.log("🔍 Checking if Transport Canada update is available...");
        const response = await axios.head(TC_ZIP_URL);
        const serverLength = response.headers['content-length'];
        const serverModified = response.headers['last-modified'];

        if (fs.existsSync(SYNC_STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'));
            if (state.length === serverLength && state.modified === serverModified) {
                console.log("✅ Canadian data is already up-to-date. Skipping.");
                return false;
            }
        }
        return { length: serverLength, modified: serverModified };
    } catch (err) {
        console.warn("⚠️ Could not check TC server. Proceeding anyway.");
        return true;
    }
}

async function downloadFile() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
    console.log(`⬇️  Downloading TC Civil Aircraft Register...`);
    const writer = fs.createWriteStream(DOWNLOAD_PATH);
    const response = await axios({ url: TC_ZIP_URL, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function extractFiles() {
    console.log(`📦 Extracting CCAR files...`);
    const zip = new AdmZip(DOWNLOAD_PATH);
    zip.extractAllTo(EXTRACT_PATH, true);
}

/**
 * Canadian data comes in multiple files. 
 * 'carscurr.txt' has the aircraft specs.
 * 'carsownr.txt' has the ownership.
 * We join them in memory by the registration mark.
 */
async function syncCanadianMarket() {
    const curPath = path.join(EXTRACT_PATH, 'carscurr.txt');
    const ownPath = path.join(EXTRACT_PATH, 'carsownr.txt');

    console.log(`🍁 Ingesting Canadian Registry (CCAR)...`);

    // 1. Map Owners first
    const ownerMap = new Map();
    const ownStream = fs.createReadStream(ownPath).pipe(csv({ headers: false }));

    console.log("   - Indexing owners...");
    for await (const row of ownStream) {
        // Col indices from sample: 0=Mark (AAC), 1=Name, 5=City, 6=State, 9=Country
        const rawMark = row[0]?.trim();
        if (!rawMark) continue;

        ownerMap.set(rawMark, {
            name: row[1]?.trim(),
            city: row[5]?.trim(),
            state: row[6]?.trim(),
            country: 'Canada'
        });
    }

    // 2. Map Aircraft and Upsert
    const curStream = fs.createReadStream(curPath).pipe(csv({ headers: false }));
    let records = [];
    let count = 0;

    console.log("   - Syncing aircraft records...");
    for await (const row of curStream) {
        // Col indices from sample: 0=Mark, 3=Mfr, 4=Model, 5=Serial, 32=Year, 39=Status, 15=EngineInfo
        const rawMark = row[0]?.trim();
        if (!rawMark) continue;

        // Standardize to C- prefix for Canadian registry
        const nNumber = rawMark.startsWith('C-') ? rawMark : 'C-' + rawMark;

        const owner = ownerMap.get(rawMark) || {};

        records.push({
            n_number: nNumber,
            serial_number: row[5]?.trim(),
            mfr_mdl_code: `${row[3]?.trim()} ${row[4]?.trim()}`,
            eng_mfr_mdl: row[15]?.trim(),
            year_mfr: row[32]?.trim()?.substring(0, 4),
            name: owner.name || 'Unknown',
            city: owner.city,
            state: owner.state,
            country: 'Canada',
            status_code: row[39]?.trim(),
            updated_at: new Date().toISOString()
        });

        if (records.length >= BATCH_SIZE) {
            await upsertBatch(records);
            count += records.length;
            process.stdout.write(`\r🚀 TC Registry Synced: ${count}`);
            records = [];
        }
    }

    if (records.length > 0) {
        await upsertBatch(records);
        count += records.length;
    }
    console.log(`\n✅ Canadian Aircraft Registry fully synced.`);
}

async function upsertBatch(batch) {
    const { error } = await supabase
        .from('aircraft_registry')
        .upsert(batch, { onConflict: 'n_number' });

    if (error) {
        console.error(`\n❌ Upsert Error (TC):`, error.message);
    }
}

async function main() {
    try {
        const syncMeta = await checkSyncNeeded();
        if (syncMeta) {
            await downloadFile();
            await extractFiles();
            await syncCanadianMarket();
            fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(syncMeta));
            console.log("✅ TC Sync Complete.");
        }
    } catch (err) {
        console.error("\n💥 Canadian Sync Failed:", err);
    }
}

main();
