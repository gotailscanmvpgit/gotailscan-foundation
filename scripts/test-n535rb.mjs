// Test N535RB Make/Model
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing N535RB Make/Model...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testN535RB() {
    const registryKey = '535RB';
    const normalizedTail = 'N535RB';

    // Check database
    const { data: dbData } = await supabase
        .from('aircraft_registry')
        .select('*')
        .or(`n_number.eq.${registryKey},n_number.eq.${normalizedTail}`)
        .limit(1)
        .maybeSingle();

    console.log('📦 Database Record:');
    if (dbData) {
        console.log('   n_number:', dbData.n_number);
        console.log('   mfr_mdl_code:', dbData.mfr_mdl_code);
        console.log('   name:', dbData.name); // Owner
        console.log('   year_mfr:', dbData.year_mfr);
        console.log('   kit_mfr:', dbData.kit_mfr);
        console.log('   kit_model:', dbData.kit_model);
    } else {
        console.log('   ❌ Not found in DB');
    }
    console.log('');

    // Test orchestration
    const { data: orchData } = await supabase.functions.invoke('orchestrateForensicScan', {
        body: { tail_number: 'N535RB' }
    });

    console.log('🛠️  Orchestration Result:');
    if (orchData) {
        console.log('   Make/Model:', orchData.aircraft_details?.make_model);
        console.log('   Year:', orchData.aircraft_details?.year);
    }
    console.log('');
}

testN535RB();
