const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTail(tail) {
    console.log(`Checking data for ${tail}...`);

    // 1. Check Registry
    const { data: registry } = await supabase
        .from('mv_aircraft_summary')
        .select('*')
        .eq('n_number', tail.startsWith('N') ? tail.substring(1) : tail)
        .maybeSingle();

    console.log('Registry:', JSON.stringify(registry, null, 2));

    // 2. Check NTSB
    const { data: ntsb } = await supabase
        .from('forensic_ntsb')
        .select('*')
        .eq('n_number', tail);

    console.log('NTSB Records:', JSON.stringify(ntsb, null, 2));

    // 3. Check SDR
    const { data: sdr } = await supabase
        .from('forensic_sdr')
        .select('*')
        .eq('n_number', tail);

    console.log('SDR Records:', JSON.stringify(sdr, null, 2));
}

const tail = process.argv[2] || 'N6195F';
checkTail(tail);
