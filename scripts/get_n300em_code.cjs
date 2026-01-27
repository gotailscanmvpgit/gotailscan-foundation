const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getCode() {
    const { data, error } = await supabase
        .from('aircraft_registry')
        .select('mfr_mdl_code, model_name')
        .eq('n_number', 'N300EM')
        .maybeSingle();

    if (error) {
        console.error("Error fetching N300EM:", error);
    } else {
        console.log("N300EM Code:", data ? data.mfr_mdl_code : "NOT FOUND");
    }
}

getCode();
