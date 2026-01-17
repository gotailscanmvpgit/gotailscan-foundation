
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedFriend() {
    console.log("✈️ Seeding N904GS (Friend's Aircraft)...");

    // 2015 Cessna TTx (T240)
    const aircraft = {
        n_number: '904GS',
        serial_number: 'T24002090',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: 'T240 (TTx)',
        year_mfr: '2015',
        name: 'VAN BORTEL AIRCRAFT INC',
        city: 'ARLINGTON',
        state: 'TX',
        country: 'US',
        type_aircraft: '1', // Fixed wing single engine
        type_engine: '5',   // Reciprocating
        status_code: 'N'
    };

    const { error: regError } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft, { onConflict: 'n_number' });

    if (regError) {
        console.error("❌ Error seeding registry:", regError);
    } else {
        console.log("✅ N904GS successfully integrated into the registry.");
    }

    // Add realistic SDR: Environmental Systems - Air Conditioning Component
    const sdr = {
        n_number: 'N904GS', // SDRs use the full tail in the forensic table
        report_date: '2023-04-12',
        control_number: 'SDR-904GS-1',
        part_name: 'A/C COMPRESSOR COUPLING',
        nature_of_condition: 'PREMATURE WEAR',
        description: 'During scheduled 100-hour inspection, technician noted excessive play in the air conditioning compressor drive coupling. Replaced with new part as per Cessna T240 Service Letter.'
    };

    const { error: sdrError } = await supabase
        .from('forensic_sdr')
        .insert(sdr);

    if (sdrError) {
        console.error("❌ Error seeding SDR:", sdrError);
    } else {
        console.log("🛠️ Maintenance Intelligence record added for N904GS.");
    }
}

seedFriend();
