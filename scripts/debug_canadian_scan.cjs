
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testScan(tail) {
    console.log(`🧪 Testing Orchestrator for: ${tail}`);
    const { data, error } = await supabase.functions.invoke('orchestrateForensicScan', {
        body: { tail_number: tail }
    });

    if (error) {
        console.error("❌ Orchestrator Error:", error);
    } else {
        console.log("✅ Success:", JSON.stringify(data, null, 2));
    }
}

testScan('C-GJED');
