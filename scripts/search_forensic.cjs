const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function searchForensic(tail) {
    console.log(`Searching forensic records for ${tail}...`);

    const { data: ntsb } = await supabase
        .from('forensic_ntsb')
        .select('*')
        .ilike('n_number', `%${tail.replace('N', '')}%`);

    console.log('NTSB Matches:', JSON.stringify(ntsb, null, 2));

    const { data: sdr } = await supabase
        .from('forensic_sdr')
        .select('*')
        .ilike('n_number', `%${tail.replace('N', '')}%`);

    console.log('SDR Matches:', JSON.stringify(sdr, null, 2));
}

searchForensic('N6195F');
