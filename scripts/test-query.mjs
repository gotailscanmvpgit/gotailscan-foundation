// Test .or() query
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrQuery() {
    const registryKey = '350KA';
    const normalizedTail = 'N350KA';

    console.log(`Testing .or() with: n_number.eq.${registryKey},n_number.eq.${normalizedTail}`);

    const { data, error } = await supabase
        .from('aircraft_registry')
        .select('*')
        .or(`n_number.eq.${registryKey},n_number.eq.${normalizedTail}`)
        .maybeSingle();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data found:', data ? 'YES' : 'NO');
        if (data) console.log(data);
    }

    console.log('\nTesting .in() instead:');
    const { data: dataIn, error: errorIn } = await supabase
        .from('aircraft_registry')
        .select('*')
        .in('n_number', [registryKey, normalizedTail])
        .maybeSingle();

    if (errorIn) {
        console.error('Error (IN):', errorIn);
    } else {
        console.log('Data found (IN):', dataIn ? 'YES' : 'NO');
        if (dataIn) console.log(dataIn);
    }
}

testOrQuery();
