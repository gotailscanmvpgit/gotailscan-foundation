
// Test Performance Data
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Performance Data for N350KA...\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPerformance() {
    // Test orchestration
    const { data: orchData, error } = await supabase.functions.invoke('orchestrateForensicScan', {
        body: { tail_number: 'N350KA' }
    });

    if (error) {
        console.error('Error invoking function:', error);
        return;
    }

    console.log('🛠️  Orchestration Result:');
    if (orchData) {
        console.log('   Performance Object:', orchData.performance);
        if (orchData.performance) {
            console.log('   ✅ Performance data found!');
        } else {
            console.log('   ❌ Performance data MISSING!');
        }
    } else {
        console.log('   ❌ No data returned');
    }
}

testPerformance();
