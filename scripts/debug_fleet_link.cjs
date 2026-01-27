const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugDataLink() {
    console.log("🕵️‍♀️ Debugging N300EM Data Linkage...\n");

    // 1. Check Registry
    const { data: registry, error: regError } = await supabase
        .from('aircraft_registry')
        .select('n_number, mfr_mdl_code, name, mfr_mdl_code')
        .eq('n_number', 'N300EM')
        .maybeSingle();

    if (regError) console.error("Registry Error:", regError);
    console.log("✈️ Registry Record:", registry || "NOT FOUND");

    if (!registry) return;

    // 2. Check SDRs for this Tail
    const { data: sdrs, error: sdrError } = await supabase
        .from('forensic_sdr')
        .select('*')
        .eq('n_number', 'N300EM');

    if (sdrError) console.error("SDR Error:", sdrError);
    console.log(`📋 Found ${sdrs?.length} SDRs for N300EM:`);
    sdrs?.forEach(s => console.log(`   - ${s.part_name}: ${s.description}`));

    // 3. Check Fleet View for this Code
    if (registry.mfr_mdl_code) {
        console.log(`\n📊 Checking Fleet View for Code: ${registry.mfr_mdl_code}`);
        const { data: fleet, error: viewError } = await supabase
            .from('mv_fleet_reliability')
            .select('*')
            .eq('mfr_mdl_code', registry.mfr_mdl_code);

        if (viewError) console.error("View Error:", viewError);
        console.log("   Fleet View Record:", fleet && fleet.length > 0 ? JSON.stringify(fleet[0], null, 2) : "NO DATA IN VIEW");
    } else {
        console.log("\n⚠️ Registry record has NO mfr_mdl_code! Linkage is broken.");
    }
}

debugDataLink();
