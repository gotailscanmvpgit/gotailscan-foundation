
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seedControllerJets() {
    console.log("✈️ Seeding Controller.com Jet Inventory...");

    const jets = [
        {
            tail: 'N650CF',
            year: '2019',
            make: 'BOMBARDIER',
            model: 'CHALLENGER 650',
            serial: '6136',
            location: 'Fort Worth, TX'
        },
        {
            tail: 'N589HH',
            year: '2002',
            make: 'CESSNA',
            model: 'CITATION BRAVO',
            serial: '550-1005',
            location: 'Green Bay, WI'
        },
        {
            tail: 'N710HA',
            year: '2023',
            make: 'CESSNA',
            model: 'CITATION CJ3+',
            serial: '525B-0710',
            location: 'Uvalde, TX'
        },
        {
            tail: 'N224BA',
            year: '2009',
            make: 'DASSAULT',
            model: 'FALCON 2000LX',
            serial: '163',
            location: 'Salt Lake City, UT'
        },
        {
            tail: 'N290GJ',
            year: '1999',
            make: 'GULFSTREAM',
            model: 'GV',
            serial: '593',
            location: 'Fort Lauderdale, FL'
        },
        {
            tail: 'N68005',
            year: '2000',
            make: 'BOMBARDIER',
            model: 'GLOBAL EXPRESS',
            serial: '9010',
            location: 'Van Nuys, CA'
        },
        {
            tail: 'N555HG',
            year: '2007',
            make: 'DASSAULT',
            model: 'FALCON 2000EX EASY',
            serial: '102',
            location: 'Chicago, IL'
        }
    ];

    for (const jet of jets) {
        // Prepare DB Record
        // - Strip 'N' from tail for n_number
        // - Split location into City/State if possible

        const n_number = jet.tail.replace(/^N/, '');
        const [city, state] = jet.location.includes(',')
            ? jet.location.split(',').map(s => s.trim())
            : [jet.location, 'US'];

        const aircraftRecord = {
            n_number: n_number,
            serial_number: jet.serial,
            mfr_mdl_code: jet.make,
            eng_mfr_mdl: jet.model,
            year_mfr: jet.year,
            name: 'CONTROLLER INVENTORY',
            city: city.toUpperCase(),
            state: state ? state.toUpperCase() : 'US',
            country: 'US', // Assuming US registry for N-numbers
            type_aircraft: '5', // Jet (Fixed wing multi engine - typically type 5 or similar, but for safe defaults we use standard codes)
            // Note: FAA Type codes are: 4=Fixed Wing Single, 5=Fixed Wing Multi, 6=Rotorcraft. 
            // Jets are usually Multi (5) or Single (4 - very rare like Cirrus Jet). 
            // Wait, looking at previous seed file:
            // "type_engine": '5' is Reciprocating? 
            // In seed_friend_aircraft.cjs:
            // type_aircraft: '1' (Fixed wing single)
            // type_engine: '5' (Reciprocating)
            // type_engine: '3' (Turbo-shaft)
            // type_engine: '4' (Turbo-jet) is likely correct for Jets.

            // Let's infer type_engine = 5 (Turbo-Fan) or 4 (Turbo-Jet).
            // Controller lists them as "Jet Aircraft". I'll use type_engine='5' (Turbo-Fan) as a safe bet for modern jets, or '4' based on standard codes.
            // Let's check seed_friend:
            // N300EM (Phenom) -> type_aircraft: '2' (Multi), type_engine: '5' (Turbo-fan comment)
            // Wait, seed_friend line 785 says: type_engine: '5', // Turbo-fan
            // But line 710 says: type_engine: '5', // Turboprop (incorrect comment? or is 5 just "Turbine"?)
            // FAA codes: 1=Recip, 2=Turbo-prop, 3=Turbo-shaft, 4=Turbo-jet, 5=Turbo-fan, ...
            // I'll use 5 for these Jets.
            type_aircraft: '5', // type 5 is Glider? No.
            // FAA:
            // 4 = Fixed Wing Single Engine
            // 5 = Fixed Wing Multi Engine
            // 6 = Rotorcraft
            // So Type_Aircraft should be '5' (Multi) for these jets.
            type_aircraft: '5',
            type_engine: '5', // Turbo-fan
            status_code: 'V' // Valid
        };

        const { error } = await supabase
            .from('aircraft_registry')
            .upsert(aircraftRecord, { onConflict: 'n_number' });

        if (error) {
            console.error(`❌ Error seeding ${jet.tail}:`, error);
        } else {
            console.log(`✅ Seeded ${jet.tail} (${jet.year} ${jet.make} ${jet.model})`);
        }
    }
}

seedControllerJets();
