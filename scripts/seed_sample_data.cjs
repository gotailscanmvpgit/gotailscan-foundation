
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleData = [
    // --- CELEBRITY / FAMOUS JETS ---
    { n_number: 'N628TS', serial_number: '999', mfr_mdl_code: 'GULFSTREAM', engaged: 'G650ER', year_mfr: '2019', name: 'ELON MUSK / FALCON LANDING LLC', city: 'HAWTHORNE', state: 'CA' },
    { n_number: 'N272BG', serial_number: '123', mfr_mdl_code: 'GULFSTREAM', engaged: 'IV', year_mfr: '2008', name: 'BILL GATES', city: 'SEATTLE', state: 'WA' },
    { n_number: 'N757AF', serial_number: '9992', mfr_mdl_code: 'BOEING', engaged: '757-200', year_mfr: '1991', name: 'DONALD J TRUMP', city: 'PALM BEACH', state: 'FL' },
    { n_number: 'N1', serial_number: '1', mfr_mdl_code: 'GULFSTREAM', engaged: 'G650', year_mfr: '2019', name: 'FEDERAL AVIATION ADMINISTRATION', city: 'WASHINGTON', state: 'DC' },

    // --- AIRLINES ---
    { n_number: 'N866DA', serial_number: '12344', mfr_mdl_code: 'BOEING', engaged: '777-200LR', year_mfr: '2009', name: 'DELTA AIR LINES INC', city: 'ATLANTA', state: 'GA' },
    { n_number: 'N36272', serial_number: '12355', mfr_mdl_code: 'BOEING', engaged: '737-800', year_mfr: '2001', name: 'UNITED AIRLINES', city: 'CHICAGO', state: 'IL' },
    { n_number: 'N8642E', serial_number: '5521', mfr_mdl_code: 'BOEING', engaged: '737 MAX 8', year_mfr: '2021', name: 'SOUTHWEST AIRLINES', city: 'DALLAS', state: 'TX' },

    // --- GENERAL AVIATION (Common Trainers) ---
    { n_number: 'N725DT', serial_number: '17272821', mfr_mdl_code: 'CESSNA', engaged: '172S', year_mfr: '1999', name: 'FLIGHT SCHOOL DB', city: 'DALLAS', state: 'TX' },
    { n_number: 'N172NU', serial_number: '17276520', mfr_mdl_code: 'CESSNA', engaged: '172S', year_mfr: '2005', name: 'INDEPENDENT FLYERS', city: 'DENVER', state: 'CO' },
    { n_number: 'N900KN', serial_number: '2042', mfr_mdl_code: 'CIRRUS', engaged: 'SR22', year_mfr: '2018', name: 'AVIATION LEASING LLC', city: 'KNOXVILLE', state: 'TN' },
    { n_number: 'N888XY', serial_number: '30-1234', mfr_mdl_code: 'PIPER', engaged: 'PA-28-181', year_mfr: '2001', name: 'PRIVATE PILOT LLC', city: 'MIAMI', state: 'FL' },

    // --- CORPORATE ---
    { n_number: 'N450CC', serial_number: '4120', mfr_mdl_code: 'BOMBARDIER', engaged: 'CHALLENGER 350', year_mfr: '2021', name: 'NETJETS AVIATION INC', city: 'COLUMBUS', state: 'OH' },
    { n_number: 'N600TR', serial_number: '5592', mfr_mdl_code: 'EMBRAER', engaged: 'PHENOM 300', year_mfr: '2022', name: 'FLEXJET LLC', city: 'CLEVELAND', state: 'OH' }
];

async function seed() {
    console.log(`🌱 Seeding ${sampleData.length} real(ish) aircraft...`);

    // Map to fit our schema exactly
    const records = sampleData.map(d => ({
        n_number: d.n_number.replace('N', ''), // Store as "725DT" etc without N
        serial_number: d.serial_number,
        mfr_mdl_code: d.mfr_mdl_code, // Putting "Make" here for display 
        kit_model: d.engaged,         // Putting "Model" here for display
        year_mfr: d.year_mfr,
        name: d.name,
        city: d.city,
        state: d.state,
        country: 'US'
    }));

    const { error } = await supabase.from('aircraft_registry').upsert(records, { onConflict: 'n_number' });

    if (error) {
        console.error('❌ Error Seeding:', error);
    } else {
        console.log('✅ Success! Database seeded.');
        console.log('Try searching for: N725DT, N1, N900KN, N172NU');
    }
}

seed();
