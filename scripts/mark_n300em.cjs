const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function markPlane() {
    console.log("🖊️ Marking N300EM owner as 'ANTIGRAVITY TEST'...");

    const { error } = await supabase
        .from('aircraft_registry')
        .update({ name: 'ANTIGRAVITY TEST' })
        .eq('n_number', 'N300EM');

    if (error) console.error("Error:", error);
    else console.log("✅ N300EM marked. Please check Aircraft Details in the UI.");
}

markPlane();
