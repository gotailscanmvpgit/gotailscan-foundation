
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/std@0.140.0/dotenv/load.ts";

const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Testing orchestration for N350KA...");

const { data, error } = await supabase.functions.invoke('orchestrateForensicScan', {
    body: { tailNumber: 'N350KA' }
});

if (error) {
    console.error("Error:", error);
} else {
    console.log("Performance Data:", data.performance);
}
