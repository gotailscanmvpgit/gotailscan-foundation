require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findTarget() {
    const { data, error } = await supabase
        .from('forensic_ntsb')
        .select('n_number')
        .limit(10);

    if (error) console.error(error);
    console.log('Sample N-Numbers:', data.map(d => d.n_number));
}

findTarget();
