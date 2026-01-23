
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function stressTestSanctions() {
    console.log("✈️ Starting Sanctions Logic Stress Test (100 Iterations)...");

    let blockedCount = 0;
    let cleanCount = 0;
    let errors = 0;

    // Use a mix of real N-numbers and synthetic ones
    const baseTail = 'N71';
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
        // Generate pseudo-random tail like N71001, N71002, etc.
        const tail = `${baseTail}${String(i).padStart(3, '0')}X`;

        try {
            // Call the orchestration function directly via Supabase Functions
            // Note: We use the REST API endpoint for the function
            const { data, error } = await supabase.functions.invoke('orchestrateForensicScan', {
                body: { tail_number: tail }
            });

            if (error) {
                console.error(`❌ Error scanning ${tail}:`, error.message);
                errors++;
                continue;
            }

            const compliance = data.compliance_audit;
            const status = compliance?.status;

            if (status === 'FLAGGED') {
                blockedCount++;
                console.log(`⚠️  ${tail}: FLAGGED (Sanctions/Lien)`);
            } else {
                cleanCount++;
                // console.log(`✅ ${tail}: CLEAN`); // Commented out to reduce noise
            }

            // Small delay to be nice to the API
            await new Promise(r => setTimeout(r, 50));

        } catch (err) {
            console.error(`❌ Fatal error on ${tail}:`, err);
            errors++;
        }
    }

    console.log("------------------------------------------------");
    console.log("📊 STRESS TEST RESULTS");
    console.log("------------------------------------------------");
    console.log(`Total Scans: ${iterations}`);
    console.log(`Clean:       ${cleanCount}`);
    console.log(`Flagged:     ${blockedCount}`);
    console.log(`Errors:      ${errors}`);
    console.log("------------------------------------------------");

    // Expected behavior: ~5% flagged (approx 5 out of 100).
    const rate = (blockedCount / iterations) * 100;
    console.log(`Flag Rate:   ${rate.toFixed(1)}% (Expected ~5%)`);

    if (rate > 20) {
        console.error("❌ FAILURE: Flag rate is shockingly high. The logic is likely still broken or too aggressive.");
    } else if (rate === 0) {
        console.warn("⚠️  WARNING: Flag rate is 0%. Did we make it too lenient?");
    } else {
        console.log("✅ SUCCESS: Flag rate is within expected probabilistic bounds.");
    }
}

stressTestSanctions();
