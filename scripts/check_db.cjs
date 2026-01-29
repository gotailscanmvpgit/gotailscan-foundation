require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('forensic_ntsb').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Record:', data[0]);
        console.log('Columns:', Object.keys(data[0] || {}));
    }
}
check();
