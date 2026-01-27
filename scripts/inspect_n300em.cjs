const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectPlane() {
    const { data, error } = await supabase
        .from('aircraft_registry')
        .select('*')
        .eq('n_number', 'N300EM')
        .maybeSingle();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Keys:", Object.keys(data || {}));
        console.log("Model Code:", data?.mfr_mdl_code);
        console.log("Year:", data?.year_mfr);
        console.log("Model:", data?.model);
    }
}

inspectPlane();
