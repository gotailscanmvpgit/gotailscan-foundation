const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSDR() {
    const { data, error } = await supabase.from('forensic_sdr').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("SDR Columns:", Object.keys(data[0] || {}));
    }
}

inspectSDR();
