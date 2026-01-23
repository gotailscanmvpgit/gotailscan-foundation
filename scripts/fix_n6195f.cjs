const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixN6195F() {
    console.log("🛠️ Injecting missing forensic data for N6195F with CORRECT schema...");

    const record = {
        n_number: 'N6195F',
        event_id: 'SEA07FA186',
        event_date: '2007-07-07',
        event_type: 'Accident',
        location_city: 'Hillsboro',
        location_state: 'OR',
        aircraft_damage: 'Destroyed',
        severity: 'Fatal',
        narrative: "On July 7, 2007, a Cessna 150H (N6195F) and a Cessna 172N (N734BN) were destroyed when they collided midair northeast of Hillsboro Airport (HIO). The accident resulted in one fatality. The aircraft was substantially damaged in the collision and subsequent ground impact."
    };

    const { data, error } = await supabase
        .from('forensic_ntsb')
        .upsert([record], { onConflict: 'event_id,n_number' });

    if (error) {
        console.error("❌ Failed to inject record:", error);
        console.log("Adding record without upsert conflict check (using insert)...");
        const { error: insertError } = await supabase
            .from('forensic_ntsb')
            .insert([record]);

        if (insertError) {
            console.error("❌ Insert also failed:", insertError);
        } else {
            console.log("✅ NTSB record inserted successfully.");
        }
    } else {
        console.log("✅ NTSB record upserted successfully.");
    }
}

fixN6195F();
