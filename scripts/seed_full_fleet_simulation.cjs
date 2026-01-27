const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const FLEET_SPECS = [
    {
        code: 'EMB505', // Embraer Phenom 300
        count: 500,
        model_name: 'EMBRAER PHENOM 300E',
        years: [2010, 2024],
        failures: [
            { part: 'BLEED AIR VALVE', prob: 0.15, min_age: 0, max_age: 20 },
            { part: 'BRAKE CONTROL UNIT', prob: 0.25, min_age: 5, max_age: 20 }, // Wear item
            { part: 'FLAP ACTUATOR', prob: 0.1, min_age: 8, max_age: 20 },
            { part: 'AVIONICS COOLING FAN', prob: 0.2, min_age: 0, max_age: 3 } // Infant mortality
        ]
    }
];

async function seedSimulation() {
    console.log("🚀 Starting Full Fleet Reliability Simulation...");

    // 1. Update N300EM to ensure it is part of this fleet
    console.log("Updating N300EM to cohort leader...");
    await supabase.from('aircraft_registry').upsert({
        n_number: 'N300EM',
        mfr_mdl_code: 'EMB505',
        year_mfr: 2022
    });

    for (const fleet of FLEET_SPECS) {
        console.log(`Generating ${fleet.count} aircraft for ${fleet.code}...`);

        const aircraftBatch = [];
        const sdrBatch = [];

        for (let i = 0; i < fleet.count; i++) {
            // Use sequential N-numbers to ensure uniqueness in batch
            const n_number = `N${50000 + i}X`;
            const year = Math.floor(Math.random() * (fleet.years[1] - fleet.years[0] + 1)) + fleet.years[0];
            const age = 2026 - year; // Current simulated year

            aircraftBatch.push({
                n_number: n_number,
                mfr_mdl_code: fleet.code,
                year_mfr: year
            });

            // Generate SDRs
            fleet.failures.forEach(fail => {
                if (age >= fail.min_age && age <= fail.max_age) {
                    if (Math.random() < fail.prob) {
                        sdrBatch.push({
                            n_number: n_number,
                            part_name: fail.part,
                            report_date: new Date(year + Math.floor(Math.random() * age), 0, 1).toISOString(),
                            nature_of_condition: 'FAILURE',
                            control_number: `${year}FA${Math.floor(Math.random() * 90000) + 10000}`,
                            description: `Synthetic failure of ${fail.part} at age ${age}`
                        });
                    }
                }
            });
        }

        // Batch Insert Aircraft
        const { error: acError } = await supabase.from('aircraft_registry').upsert(aircraftBatch, { onConflict: 'n_number' });
        if (acError) console.error("Aircraft Insert Error:", acError);

        // Batch Insert SDRs
        if (sdrBatch.length > 0) {
            const { error: sdrError } = await supabase.from('forensic_sdr').insert(sdrBatch);
            if (sdrError) console.error("SDR Insert Error:", sdrError);
        }

        console.log(`  -> Inserted ${aircraftBatch.length} aircraft and ${sdrBatch.length} failure reports.`);
    }

    console.log("✅ Simulation Complete.");
}

seedSimulation();
