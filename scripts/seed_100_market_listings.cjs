
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const manufacturers = ['CESSNA', 'PIPER', 'BEECHCRAFT', 'CIRRUS', 'DAHER', 'PILATUS', 'EMBRAER', 'BOMBARDIER', 'GULFSTREAM', 'HONDA'];
const models = {
    'CESSNA': ['172S', '182T', '206H', 'CITATION CJ4', 'CITATION LATITUDE'],
    'PIPER': ['ARCHER LX', 'SEMINOLE', 'M600 SLS', 'MALIBU MIRAGE'],
    'BEECHCRAFT': ['BONANZA G36', 'KING AIR 360', 'KING AIR 250'],
    'CIRRUS': ['SR22 G6', 'SF50 VISION JET'],
    'DAHER': ['TBM 960', 'KODIAK 100'],
    'PILATUS': ['PC-12 NGX', 'PC-24'],
    'EMBRAER': ['PHENOM 300E', 'PRAETOR 600'],
    'BOMBARDIER': ['CHALLENGER 350', 'GLOBAL 7500'],
    'GULFSTREAM': ['G700', 'G650ER'],
    'HONDA': ['HONDAJET ELITE II']
};

async function seedMarket() {
    console.log("🚀 Seeding 100 Market Listings...");

    // Clear existing Test Data to avoid collisions (Optional, but cleaner)
    // await supabase.from('aircraft_registry').delete().like('n_number', 'TEST%');

    const listings = [];
    for (let i = 1; i <= 100; i++) {
        const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const modelList = models[mfr];
        const model = modelList[Math.floor(Math.random() * modelList.length)];

        // Generate pseudo-random Tail: N + 1-3 digits + T + i (to make unique)
        // e.g. N10T1, N99T100
        const tail = `N${Math.floor(Math.random() * 90) + 10}T${i}`;

        listings.push({
            n_number: tail,
            serial_number: `TEST-${i}`,
            mfr_mdl_code: mfr,
            // Varying the Source Text format to test robustness
            eng_mfr_mdl: Math.random() > 0.5 ? `${model}` : `${mfr} ${model}`,
            year_mfr: (2000 + Math.floor(Math.random() * 24)).toString(),
            name: `MARKET TESTER ${i}`,
            city: 'TESTVILLE',
            state: 'US',
            country: 'US',
            type_aircraft: '1',
            type_engine: '5',
            status_code: 'T' // Test status
        });
    }

    const { error } = await supabase.from('aircraft_registry').upsert(listings, { onConflict: 'n_number' });

    if (error) {
        console.error("❌ Seed Failed:", error);
    } else {
        console.log("✅ Successfully seeded 100 Test Aircraft into Registry.");
    }
}

seedMarket();
