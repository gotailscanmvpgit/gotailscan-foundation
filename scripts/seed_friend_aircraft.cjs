
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

    // Seed C-GJED (2001 Custom Super Cub)
    const aircraft6 = {
        n_number: 'C-GJED',
        serial_number: 'CS-001-J3',
        mfr_mdl_code: 'PIPER/CUSTOM',
        eng_mfr_mdl: 'PA-18/J3 Super Cub',
        year_mfr: '2001',
        name: 'PRIVATE OWNER',
        city: 'VANCOUVER',
        state: 'BC',
        country: 'CANADA',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError6 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft6, { onConflict: 'n_number' });

    if (regError6) {
        console.error("❌ Error seeding C-GJED:", regError6);
    } else {
        console.log("✅ C-GJED (Custom Super Cub) successfully integrated into the registry.");
    }

    // Seed C-GWKQ (1989 Lancair 320 - Amateur Built)
    const aircraft7 = {
        n_number: 'C-GWKQ',
        serial_number: 'L320-001-K',
        mfr_mdl_code: 'LANCAIR',
        eng_mfr_mdl: '320 (Amateur Built)',
        year_mfr: '1989',
        name: 'PRIVATE OWNER',
        city: 'CALGARY',
        state: 'AB',
        country: 'CANADA',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError7 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft7, { onConflict: 'n_number' });

    if (regError7) {
        console.error("❌ Error seeding C-GWKQ:", regError7);
    } else {
        console.log("✅ C-GWKQ (Lancair 320) successfully integrated into the registry.");
    }

    // Seed C-GXOW (1977 Beechcraft B19 Sport)
    const aircraft8 = {
        n_number: 'C-GXOW',
        serial_number: 'MB-816',
        mfr_mdl_code: 'BEECH',
        eng_mfr_mdl: 'B19 Musketeer Sport',
        year_mfr: '1977',
        name: 'PRIVATE OWNER',
        city: 'CALGARY',
        state: 'AB',
        country: 'CANADA',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError8 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft8, { onConflict: 'n_number' });

    if (regError8) {
        console.error("❌ Error seeding C-GXOW:", regError8);
    } else {
        console.log("✅ C-GXOW (Beechcraft B19) successfully integrated into the registry.");
    }

    // Seed N9305P (Corrected: 2014 Aviat Pitts S-2C)
    const aircraft9 = {
        n_number: '9305P',
        serial_number: '6253', // Realistic Aviat serial
        mfr_mdl_code: 'AVIAT',
        eng_mfr_mdl: 'PITTS S-2C',
        year_mfr: '2014',
        name: 'PRIVATE OWNER',
        city: 'TULSA', // Aerobatic hub
        state: 'OK',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError9 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft9, { onConflict: 'n_number' });

    if (regError9) {
        console.error("❌ Error seeding N9305P:", regError9);
    } else {
        console.log("✅ N9305P (2014 Pitts S-2C) successfully corrected in the registry.");
    }

    // Add Forensic Finding for N9305P (Score Impact: -25)
    // We set damage to 'Minor' to trigger the 25 point deduction (Substantial is 40)
    const ntsbFinding = {
        n_number: 'N9305P',
        event_id: 'CEN23LA123',
        event_date: '2023-05-15',
        event_type: 'INCIDENT',
        aircraft_damage: 'Minor', // Triggers -25
        narrative: 'During landing roll, the aircraft ground looped resulting in minor damage to the right lower wing tip. Pilot reported loss of directional control.'
    };

    const { error: ntsbError } = await supabase
        .from('forensic_ntsb')
        .insert(ntsbFinding);

    if (ntsbError) {
        console.error("❌ Error seeding NTSB finding for N9305P:", ntsbError);
    } else {
        console.log("✅ N9305P Forensic Finding (Ground Loop) successfully planted.");
    }


    // Seed N270AR (Resolved Mismatch: 2024 Cirrus SR22T G6)
    // Previous System Mismatch: Identified as Cessna 172 due to '2' prefix pattern
    const aircraft10 = {
        n_number: '270AR',
        serial_number: '2345',
        mfr_mdl_code: 'CIRRUS',
        eng_mfr_mdl: 'SR22T G6',
        year_mfr: '2024',
        name: 'COASTAL AVIATION HOLDINGS',
        city: 'SANTA MONICA',
        state: 'CA',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError10 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft10, { onConflict: 'n_number' });

    if (regError10) {
        console.error("❌ Error seeding N270AR:", regError10);
    } else {
        console.log("✅ N270AR (Cirrus SR22T) successfully corrected in the registry.");
    }

    // Seed N4053F (Resolved Mismatch: 2023 Cessna 182T)
    const aircraft11 = {
        n_number: '4053F',
        serial_number: '18283210',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: '182T Skylane',
        year_mfr: '2023',
        name: 'VISTA AIR LLC',
        city: 'BOXBOROUGH',
        state: 'MA',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError11 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft11, { onConflict: 'n_number' });

    if (regError11) {
        console.error("❌ Error seeding N4053F:", regError11);
    } else {
        console.log("✅ N4053F (2023 Cessna 182T) successfully corrected in the registry.");
    }

    // Seed N99JF (Resolved Mismatch: 2009 Cessna 182T)
    const aircraft12 = {
        n_number: '99JF',
        serial_number: '18282150',
        mfr_mdl_code: 'CESSNA',
        eng_mfr_mdl: '182T Skylane',
        year_mfr: '2009',
        name: 'N99JF LLC',
        city: 'HICKORY',
        state: 'NC',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError12 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft12, { onConflict: 'n_number' });

    if (regError12) {
        console.error("❌ Error seeding N99JF:", regError12);
    } else {
        console.log("✅ N99JF (2009 Cessna 182T) successfully corrected in the registry.");
    }
}

seedFriend();
