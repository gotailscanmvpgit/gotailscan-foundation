
const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

const VALIDATION_CASES = [
    { tail: "N799PC", expected_profile: "WALK AWAY", desc: "Known Accident (Injected)" },
    { tail: "N30HQ", expected_make: "DASSAULT", desc: "Demo Override (Falcon 900)" },
    { tail: "N12345", expected_profile: "INVESTIGATE", desc: "Baseline (Random/Clean)" }
];

async function validate() {
    console.log("Starting Final Search Validation...\n");

    for (const test of VALIDATION_CASES) {
        console.log(`[TEST] ${test.desc} [${test.tail}]`);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ANON_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tail_number: test.tail })
            });

            if (!res.ok) {
                console.error(`  ❌ Failed with status: ${res.status}`);
                continue;
            }

            const data = await res.json();
            const profile = data.ai_intelligence?.risk_profile;
            const verdict = data.ai_intelligence?.audit_verdict;
            const makeModel = data.aircraft_details?.make_model;
            const safety = data.risk_metrics?.safety;

            console.log(`  - Make/Model: ${makeModel}`);
            console.log(`  - Safety Score: ${safety}/100`);
            console.log(`  - Risk Profile: ${profile}`);
            console.log(`  - Verdict: ${verdict}`);

            if (test.expected_profile && profile !== test.expected_profile) {
                console.error(`  ❌ FAIL: Expected profile ${test.expected_profile}, got ${profile}`);
            } else if (test.expected_make && !makeModel.includes(test.expected_make)) {
                console.error(`  ❌ FAIL: Expected make ${test.expected_make}, got ${makeModel}`);
            } else {
                console.log(`  ✅ PASS`);
            }
            console.log("");
        } catch (e) {
            console.error(`  ❌ Error: ${e.message}`);
        }
    }
    console.log("Validation Complete.");
}

validate();
