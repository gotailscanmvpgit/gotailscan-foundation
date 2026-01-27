
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Querying mv_fleet_reliability...');

    // Get one row to verify
    const { data, error } = await supabase
        .from('mv_fleet_reliability')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error querying view:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Successfully retrieved data from mv_fleet_reliability:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('View is empty or no data returned.');
    }
}

verify();
