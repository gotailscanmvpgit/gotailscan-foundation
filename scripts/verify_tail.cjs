require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyTail() {
    const tail = 'N9305P';
    console.log(`Checking ${tail}...`);

    try {
        const { data: ntsb, error: ntsbErr } = await supabase.from('forensic_ntsb').select('acft_make, acft_model').eq('n_number', tail);
        if (ntsbErr) console.error('NTSB Error:', ntsbErr);
        else console.log('NTSB Record count:', ntsb.length, 'Samples:', ntsb.slice(0, 2));

        const { data: reg, error: regErr } = await supabase.from('aircraft_registry').select('mfr_mdl_code').eq('n_number', tail);
        if (regErr) console.error('Reg Error:', regErr);
        else console.log('Registry Record:', reg);
    } catch (e) {
        console.error('Fatal:', e);
    }
}

verifyTail();
