const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugLink() {
    console.log("🔍 Diagnosing N300EM Fleet Link...");

    // 1. Check Aircraft Code
    const { data: ac } = await supabase.from('aircraft_registry').select('mfr_mdl_code, year_mfr').eq('n_number', 'N300EM').maybeSingle();
    console.log(`N300EM Code: [${ac?.mfr_mdl_code}] Year: [${ac?.year_mfr}]`);

    if (!ac) return;

    // 2. Check Raw SDRs for this code (JOIN)
    const { data: rawSDRs, error: joinError } = await supabase
        .from('forensic_sdr')
        .select('part_name, n_number, aircraft_registry!inner(mfr_mdl_code)')
        .eq('aircraft_registry.mfr_mdl_code', ac.mfr_mdl_code)
        .limit(10);

    if (joinError) console.error("Join Error:", joinError);
    else {
        const parts = rawSDRs.map(r => r.part_name);
        console.log(`Raw SDR Samples for Code ${ac.mfr_mdl_code}:`, parts.length > 0 ? parts : "NONE FOUND");
    }

    // 3. Check View
    const { data: view, error: viewError } = await supabase
        .from('mv_fleet_reliability')
        .select('*')
        .eq('mfr_mdl_code', ac.mfr_mdl_code);

    if (viewError) console.error("View Error:", viewError);
    else {
        console.log("View Entry for " + ac.mfr_mdl_code + ":");
        if (view && view.length > 0) {
            console.dir(view[0].top_reliability_issues, { depth: null });
        } else {
            console.log("NO VIEW ENTRY FOUND");
        }
    }
}

debugLink();
