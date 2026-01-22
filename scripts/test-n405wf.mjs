// Test N405WF
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing N405WF...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testN405WF() {
    // Check database
    const { data: dbData } = await supabase
        .from('aircraft_registry')
        .select('*')
        .eq('n_number', '405WF')
        .maybeSingle();

    console.log('📦 Database Record:');
    if (dbData) {
        console.log('   n_number:', dbData.n_number);
        console.log('   mfr_mdl_code:', dbData.mfr_mdl_code);
        console.log('   year_mfr:', dbData.year_mfr);
        console.log('   name:', dbData.name);
    }
    console.log('');

    // Test orchestration
    const { data: orchData } = await supabase.functions.invoke('orchestrateForensicScan', {
        body: { tail_number: 'N405WF' }
    });

    console.log('🛠️  Orchestration Result:');
    if (orchData) {
        console.log('   Make/Model:', orchData.aircraft_details?.make_model);
        console.log('   Year:', orchData.aircraft_details?.year);
        console.log('   Owner:', orchData.aircraft_details?.owner);
    }
    console.log('');

    console.log('💡 Analysis:');
    console.log('   mfr_mdl_code:', dbData?.mfr_mdl_code);
    console.log('   Displayed as:', orchData?.aircraft_details?.make_model);
    console.log('');
}

testN405WF();
