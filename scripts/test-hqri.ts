
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gwwyzrzbkhnebmslpuzb.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScan() {
    console.log("Testing orchestrateForensicScan for HQRI...");
    const { data, error } = await supabase.functions.invoke('orchestrateForensicScan', {
        body: { tailNumber: 'N350KA' }
    });

    if (error) {
        console.error("Function Error:", error);
    } else {
        console.log("Success!");
        console.log("HQRI Data:", data.report.hangar_queen_index);

        if (!data.report.hangar_queen_index) {
            console.error("CRITICAL: hangar_queen_index is MISSING from report.");
            console.log("Keys available:", Object.keys(data.report));
        }
    }
}

testScan();
