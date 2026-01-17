
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

    // Seed N212FA (Resolved Mismatch: 2021 Cirrus SR20)
    const aircraft13 = {
        n_number: '212FA',
        serial_number: '2736',
        mfr_mdl_code: 'CIRRUS',
        eng_mfr_mdl: 'SR20 G6',
        year_mfr: '2021',
        name: 'FLY LIKE A G6 LLC',
        city: 'GRANADA HILLS',
        state: 'CA',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError13 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft13, { onConflict: 'n_number' });

    if (regError13) {
        console.error("❌ Error seeding N212FA:", regError13);
    } else {
        console.log("✅ N212FA (2021 Cirrus SR20 G6) successfully corrected in the registry.");
    }

    // Seed N77CE (Verified: 1978 Beechcraft King Air E90)
    const aircraft14 = {
        n_number: '77CE',
        serial_number: 'LW-257',
        mfr_mdl_code: 'BEECH',
        eng_mfr_mdl: 'E90 King Air',
        year_mfr: '1978',
        name: 'SMALL PLANE LLC',
        city: 'CARSON CITY',
        state: 'NV',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5', // Turboprop
        status_code: 'N'
    };

    const { error: regError14 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft14, { onConflict: 'n_number' });

    if (regError14) {
        console.error("❌ Error seeding N77CE:", regError14);
    } else {
        console.log("✅ N77CE (1978 King Air E90) successfully corrected in the registry.");
    }

    // Seed N72121 (Verified: 1984 Beechcraft A36 Turbine)
    const aircraft15 = {
        n_number: '72121',
        serial_number: 'E-2202',
        mfr_mdl_code: 'BEECH',
        eng_mfr_mdl: 'A36 Bonanza (Turbine)',
        year_mfr: '1984',
        name: 'I FLY PLANES LLC',
        city: 'TULSA',
        state: 'OK',
        country: 'US',
        type_aircraft: '1',
        type_engine: '3', // Turbo-shaft
        status_code: 'N'
    };

    const { error: regError15 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft15, { onConflict: 'n_number' });

    if (regError15) {
        console.error("❌ Error seeding N72121:", regError15);
    } else {
        console.log("✅ N72121 (1984 Beechcraft A36 Turbine) successfully corrected in the registry.");
    }

    // --- CONTROLLER / TRADE-A-PLANE BATCH (MARKET INVENTORY) ---
    const marketBatch = [
        { n: '67JV', y: '1978', m: 'CESSNA', mod: '421C', s: '421C-0402', t: '1', e: '5' },
        { n: '89RD', y: '2005', m: 'AEROCOMP', mod: 'COMP AIR 9', s: '05001', t: '1', e: '3' }, // Turbine
        { n: '30HQ', y: '1999', m: 'DASSAULT', mod: 'FALCON 900EX', s: '57', t: '2', e: '4' }, // Jet
        { n: '904GS', y: '2015', m: 'CESSNA', mod: 'TTX', s: 'T24002058', t: '1', e: '5' }, // Piston
        { n: '60SC', y: '2014', m: 'CZECH SPORT', mod: 'SPORTCRUISER', s: '13SC051', t: '1', e: '5' }, // LSA
        { n: '416EA', y: '2025', m: 'PIPISTREL', mod: 'TAURUS ELECTRO G2', s: 'P-101', t: '1', e: '7' }, // Electric
        { n: '106GK', y: '2013', m: 'LEARJET', mod: '70', s: '70-006', t: '2', e: '4' },
        { n: '451BD', y: '2006', m: 'LEARJET', mod: '60SE', s: '60-305', t: '2', e: '4' },
        { n: '76VY', y: '2020', m: 'VANS', mod: 'RV-14A', s: '140021', t: '1', e: '5' }
    ];

    for (const p of marketBatch) {
        const { error } = await supabase.from('aircraft_registry').upsert({
            n_number: p.n,
            year_mfr: p.y,
            mfr_mdl_code: p.m,
            eng_mfr_mdl: p.mod,
            serial_number: p.s,
            type_aircraft: p.t,
            type_engine: p.e,
            name: 'MARKET INVENTORY LLC',
            city: 'MARKETPLACE',
            state: 'US',
            country: 'US',
            status_code: 'N'
        }, { onConflict: 'n_number' });

        if (error) console.error(`❌ Batch Error ${p.n}:`, error);
        else console.log(`✅ Market Batch: Seeded ${p.n} (${p.y} ${p.m} ${p.mod})`);
    }

    // Seed N350KA (Verified: 1999 Beechcraft B300 King Air 350)
    const aircraft16 = {
        n_number: '350KA',
        serial_number: 'FL-233',
        mfr_mdl_code: 'BEECH', // Often listed as RAYTHEON/BEECH in official logs
        eng_mfr_mdl: 'B300 King Air 350',
        year_mfr: '1999',
        name: 'AMERICAN AVIATION INC',
        city: 'BROOKSVILLE',
        state: 'FL',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError16 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft16, { onConflict: 'n_number' });

    if (regError16) {
        console.error("❌ Error seeding N350KA:", regError16);
    } else {
        console.log("✅ N350KA (1999 King Air 350) successfully corrected in the registry.");
    }

    // Seed N514TB (Verified: 1990 Beechcraft King Air B200)
    const aircraft17 = {
        n_number: '514TB',
        serial_number: 'BB-1351',
        mfr_mdl_code: 'BEECH',
        eng_mfr_mdl: 'B200 King Air',
        year_mfr: '1990',
        name: 'VERIFIED OWNER', // Data privacy or generic
        city: 'VERIFIED CITY',
        state: 'US',
        country: 'US',
        type_aircraft: '1',
        type_engine: '5',
        status_code: 'N'
    };

    const { error: regError17 } = await supabase
        .from('aircraft_registry')
        .upsert(aircraft17, { onConflict: 'n_number' });

    if (regError17) {
        console.error("❌ Error seeding N514TB:", regError17);
    } else {
        console.log("✅ N514TB (1990 King Air B200) successfully corrected in the registry.");
    }
}

seedFriend();
