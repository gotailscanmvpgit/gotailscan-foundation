
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase keys in environment.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyReliabilityView() {
    console.log('Verifying mv_fleet_reliability view...');
    try {
        const { data, error } = await supabase
            .from('mv_fleet_reliability')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error querying mv_fleet_reliability:', error.message);
            if (error.code === '42P01') {
                console.error('VERDICT: View DOES NOT EXIST. Please run the migration.');
            } else {
                console.error('VERDICT: View exists but returned error.');
            }
        } else {
            console.log('Success! View exists and is queryable.');
            console.log('Sample Data:', data);
            console.log('VERDICT: DATABASE READY.');
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

verifyReliabilityView();
