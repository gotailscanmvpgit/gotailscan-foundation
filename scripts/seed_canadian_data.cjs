
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const canadianSampleData = [
    { n_number: 'C-GZCP', serial_number: '35215', mfr_mdl_code: 'BOEING', kit_model: '787-9', year_mfr: '2015', name: 'AIR CANADA', city: 'MONTREAL', state: 'QC', country: 'CANADA' },
    { n_number: 'C-FMWV', serial_number: '60132', mfr_mdl_code: 'BOEING', kit_model: '737 MAX 8', year_mfr: '2018', name: 'WESTJET', city: 'CALGARY', state: 'AB', country: 'CANADA' },
    { n_number: 'C-GMAA', serial_number: '1234', mfr_mdl_code: 'PILATUS', kit_model: 'PC-12/47E', year_mfr: '2010', name: 'ORNGE AIR AMBULANCE', city: 'MISSISSAUGA', state: 'ON', country: 'CANADA' },
    { n_number: 'C-GOPC', serial_number: '556', mfr_mdl_code: 'EUROCOPTER', kit_model: 'EC120B', year_mfr: '2004', name: 'ONTARIO PROVINCIAL POLICE', city: 'ORILLIA', state: 'ON', country: 'CANADA' },
    { n_number: 'C-FXYZ', serial_number: '88', mfr_mdl_code: 'DE HAVILLAND', kit_model: 'DHC-2 BEAVER', year_mfr: '1955', name: 'NORTHERN FLIGHTS LTD', city: 'YELLOWKNIFE', state: 'NT', country: 'CANADA' },
    { n_number: 'C-GYJT', serial_number: '30492', mfr_mdl_code: 'BOEING', kit_model: '737-76N', year_mfr: '2007', name: 'WESTJET', city: 'CALGARY', state: 'AB', country: 'CANADA' },
    { n_number: 'C-GCIK', serial_number: '12347', mfr_mdl_code: 'PIPER', kit_model: 'PA-28-181', year_mfr: '1995', name: 'PRIVATE OWNER', city: 'VANCOUVER', state: 'BC', country: 'CANADA' }
];

async function seedCanada() {
    console.log(`🇨🇦 Seeding ${canadianSampleData.length} Canadian aircraft...`);

    const { error } = await supabase.from('aircraft_registry').upsert(canadianSampleData, { onConflict: 'n_number' });

    if (error) {
        console.error('❌ Error Seeding Canada:', error.message);
    } else {
        console.log('✅ Success! Canadian database enriched.');
        console.log('Try searching for: C-GZCP, C-FMWV, C-FXYZ');
    }
}

seedCanada();
