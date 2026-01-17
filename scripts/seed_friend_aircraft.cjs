
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

    // Seed N669DB (Cessna T206H)
    const aircraft2 = {
        n_number: '669DB',
        serial_number: 'T20608921',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: 'T206H',
        year_mfr: '2009',
        name: 'VAN BORTEL AIRCRAFT INC',
        city: 'ARLINGTON',
        state: 'TX',
        country: 'US',
        type_aircraft: '4', // Fixed wing single engine
        type_engine: '5',   // Reciprocating
        status_code: 'N'
    };

    const { error: regError2 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft2, { onConflict: 'n_number' });

    if (regError2) {
        console.error("❌ Error seeding N669DB:", regError2);
    } else {
        console.log("✅ N669DB successfully integrated into the registry.");
    }

    // Seed N865JP (Cessna T182T)
    const aircraft3 = {
        n_number: '865JP',
        serial_number: 'T18209065',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: 'T182T',
        year_mfr: '2012',
        name: 'VAN BORTEL AIRCRAFT INC',
        city: 'ARLINGTON',
        state: 'TX',
        country: 'US',
        type_aircraft: '4',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError3 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft3, { onConflict: 'n_number' });

    if (regError3) {
        console.error("❌ Error seeding N865JP:", regError3);
    } else {
        console.log("✅ N865JP successfully integrated into the registry.");
    }

    // Seed N470CS (2015 Cessna T240 / TTx)
    const aircraft4 = {
        n_number: '470CS',
        serial_number: 'T24002070',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: 'T240 (TTx)',
        year_mfr: '2015',
        name: 'WISE OWL AVIATION SERVICES LLC',
        city: 'VISTA',
        state: 'CA',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError4 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft4, { onConflict: 'n_number' });

    if (regError4) {
        console.error("❌ Error seeding N470CS:", regError4);
    } else {
        console.log("✅ N470CS (Wise Owl) successfully integrated into the registry.");
    }

    // Seed N377GK (2020 Cessna T206H)
    const aircraft5 = {
        n_number: '377GK',
        serial_number: 'T20609615',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: 'T206H (Turbo Stationair HD)',
        year_mfr: '2020',
        name: 'MUSSO AVIATION LLC',
        city: 'VILLA RICA',
        state: 'GA',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError5 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft5, { onConflict: 'n_number' });

    if (regError5) {
        console.error("❌ Error seeding N377GK:", regError5);
    } else {
        console.log("✅ N377GK (Musso Aviation) successfully integrated into the registry.");
    }
}

seedFriend();
