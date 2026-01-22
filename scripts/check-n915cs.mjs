// Quick test script to check if N915CS exists in Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking if N915CS exists in database...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkN915CS() {
    // Check with N prefix removed (FAA format)
    const { data: withoutN, error: error1 } = await supabase
        .from('aircraft_registry')
        .select('*')
        .eq('n_number', '915CS')
        .maybeSingle();

    console.log('Search for "915CS" (without N):');
    if (error1) {
        console.log('  ❌ Error:', error1.message);
    } else if (withoutN) {
        console.log('  ✅ FOUND!');
        console.log('  Details:', JSON.stringify(withoutN, null, 2));
    } else {
        console.log('  ❌ Not found');
    }

    console.log('');

    // Check with N prefix
    const { data: withN, error: error2 } = await supabase
        .from('aircraft_registry')
        .select('*')
        .eq('n_number', 'N915CS')
        .maybeSingle();

    console.log('Search for "N915CS" (with N):');
    if (error2) {
        console.log('  ❌ Error:', error2.message);
    } else if (withN) {
        console.log('  ✅ FOUND!');
        console.log('  Details:', JSON.stringify(withN, null, 2));
    } else {
        console.log('  ❌ Not found');
    }

    console.log('');

    // Try ILIKE search
    const { data: ilike, error: error3 } = await supabase
        .from('aircraft_registry')
        .select('n_number, name, mfr_mdl_code, year_mfr')
        .or('n_number.ilike.%915CS%,n_number.ilike.915CS%')
        .limit(5);

    console.log('ILIKE search for "915CS":');
    if (error3) {
        console.log('  ❌ Error:', error3.message);
    } else if (ilike && ilike.length > 0) {
        console.log(`  ✅ Found ${ilike.length} results:`);
        ilike.forEach(r => {
            console.log(`    - ${r.n_number} | ${r.name} | ${r.mfr_mdl_code} | ${r.year_mfr}`);
        });
    } else {
        console.log('  ❌ No results');
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\n💡 Conclusion:');
    if (withoutN || withN || (ilike && ilike.length > 0)) {
        console.log('   ✅ N915CS EXISTS in the database');
        console.log('   📋 The issue is likely in the orchestration function or frontend');
    } else {
        console.log('   ❌ N915CS DOES NOT EXIST in the database');
        console.log('   📋 This tail number may not be registered or data needs to be imported');
    }
    console.log('');
}

checkN915CS();
