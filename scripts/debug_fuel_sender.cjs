const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findFuelSender() {
    console.log("🔍 Searching for FUEL SENDER issue in Fleet View...");

    const { data, error } = await supabase.from('mv_fleet_reliability').select('*');

    if (error) {
        console.error("View Error:", error);
        return;
    }

    let found = false;
    for (const row of data) {
        const issues = row.top_reliability_issues || [];
        const hasFuel = issues.find(i => i.component.includes('FUEL') || i.component.includes('SENDER'));

        if (hasFuel) {
            console.log(`✅ FOUND in Model Code [${row.mfr_mdl_code}]:`);
            console.dir(hasFuel);
            found = true;
        }
    }

    if (!found) console.log("❌ 'FUEL SENDER' not found in any model stats.");
}

findFuelSender();
