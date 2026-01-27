const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const TARGET_FILE = path.join(__dirname, '../database/sdr_database_master.csv');
const BATCH_SIZE = 500;

// KNOWN FLEET ISSUES (Real-world data for realism)
const FLEET_ISSUES = {
    'CESSNA 172': [
        { part: 'VACUUM PUMP', prob: 0.3 },
        { part: 'EXHAUST SYSTEM', prob: 0.2 },
        { part: 'SEAT TRACK', prob: 0.15 },
        { part: 'ALTERNATOR', prob: 0.1 },
        { part: 'MAGNETO', prob: 0.1 }
    ],
    'CESSNA 182': [
        { part: 'CARBURETOR', prob: 0.25 },
        { part: 'EXHAUST MANIFOLD', prob: 0.25 },
        { part: 'NOSE GEAR STRUT', prob: 0.15 }
    ],
    'CIRRUS SR22': [
        { part: 'ALTERNATOR 1', prob: 0.25 },
        { part: 'DOOR LATCH', prob: 0.2 },
        { part: 'MCU (MASTER CONTROL UNIT)', prob: 0.15 },
        { part: 'STARTER ADAPTER', prob: 0.1 }
    ],
    'BEECHCRAFT A36': [
        { part: 'LANDING GEAR MOTOR', prob: 0.3 },
        { part: 'RUDDERVATOR SKIN', prob: 0.2 },
        { part: 'FUEL SELECTOR', prob: 0.1 }
    ],
    'EMBRAER PHENOM 300': [
        { part: 'BRAKE CONTROL UNIT', prob: 0.3 },
        { part: 'BLEED AIR VALVE', prob: 0.25 },
        { part: 'FLAP ACTUATOR', prob: 0.15 },
        { part: 'WINDSHIELD HEAT', prob: 0.1 }
    ],
    'PIPER PA-28': [
        { part: 'WING SPAR', prob: 0.1 },
        { part: 'FUEL SENDER', prob: 0.3 },
        { part: 'STABILATOR CABLE', prob: 0.15 }
    ]
};

// Generates 5,000 realistic SDR records
function generateCSV() {
    console.log('🏭 Generating Synthetic SDR Database (5,000 records)...');

    // Header found in official FAA exports
    let csvContent = 'N-Number,Report Date,Control Number,Part Name,Description,Nature of Condition\n';

    const models = Object.keys(FLEET_ISSUES);

    for (let i = 0; i < 5000; i++) {
        const model = models[Math.floor(Math.random() * models.length)];
        const issues = FLEET_ISSUES[model];

        // Pick an issue based on probability
        const issue = issues[Math.floor(Math.random() * issues.length)]; // Simplified random for speed

        // Generate pseudo-random Tail Number
        const tail = 'N' + Math.floor(Math.random() * 90000 + 1000);

        // Generate pseudo-random Date (last 10 years)
        const year = 2015 + Math.floor(Math.random() * 11);
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const controlNum = `${year}FA${Math.floor(Math.random() * 100000)}`;

        const line = `${tail},${date},${controlNum},${issue.part},Description of ${issue.part} failure during normal ops.,FAILURE\n`;
        csvContent += line;
    }

    // SPECIFIC INJECTIONS FOR DEMO AIRCRAFT
    // N300EM (Phenom 300)
    csvContent += `N300EM,2023-05-12,2023FA99999,BRAKE CONTROL UNIT,Brake control unit reported fault during taxi.,FAILURE\n`;
    csvContent += `N300EM,2024-01-15,2024FA11111,BLEED AIR VALVE,Right bleed air valve failed to close.,MALFUNCTION\n`;

    fs.writeFileSync(TARGET_FILE, csvContent);
    console.log(`✅ File created at: ${TARGET_FILE}`);
}

generateCSV();
