
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const jetFleet = [
    {
        n_number: 'N650GF',
        serial_number: '6355',
        mfr_mdl_code: 'GULFSTREAM AEROSPACE',
        engaged: 'G650ER',
        year_mfr: '2019',
        name: 'GLOBAL FLIGHT ASSETS TRUST',
        city: 'WILMINGTON',
        state: 'DE'
    },
    {
        n_number: 'N700CJ',
        serial_number: '700-0034',
        mfr_mdl_code: 'CESSNA',
        engaged: 'CITATION LONGITUDE',
        year_mfr: '2021',
        name: 'TEXTRON AVIATION INC',
        city: 'WICHITA',
        state: 'KS'
    },
    {
        n_number: 'N300EM',
        serial_number: '50500652',
        mfr_mdl_code: 'EMBRAER',
        engaged: 'PHENOM 300E',
        year_mfr: '2022',
        name: 'EXECUTIVE JET MANAGEMENT',
        city: 'CINCINNATI',
        state: 'OH'
    }
];

async function seed() {
    console.log(`✈️ Seeding ${jetFleet.length} Business Jets...`);

    const records = jetFleet.map(d => ({
        n_number: d.n_number.replace('N', ''),
        serial_number: d.serial_number,
        mfr_mdl_code: d.mfr_mdl_code,
        eng_mfr_mdl: d.engaged, // Using eng_mfr_mdl as model field sometimes, orchestrator checks kit_model OR eng_mfr_mdl
        kit_model: d.engaged,
        year_mfr: d.year_mfr,
        name: d.name,
        city: d.city,
        state: d.state,
        country: 'US'
    }));

    const { error } = await supabase.from('aircraft_registry').upsert(records, { onConflict: 'n_number' });

    if (error) {
        console.error('❌ Error Seeding Jets:', error);
    } else {
        console.log('✅ Success! Jet Fleet added to Database.');
        jetFleet.forEach(j => console.log(`   - ${j.n_number}: ${j.mfr_mdl_code} ${j.engaged}`));
    }
}

seed();
