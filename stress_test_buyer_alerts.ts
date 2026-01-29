
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

// Target scenarios for Buyer Critical Alerts
const SCENARIOS = [
    { tail: "N799PC", desc: "N799PC (Known Accident History Injection)" },
    { tail: "N12345", desc: "Random Tail (Baseline)" },
    { tail: "N999XX", desc: "High Risk Random (Simulated)" }
];

console.log("Starting Buyer Critical Alert Stress Test...");

const runTest = async () => {
    for (const s of SCENARIOS) {
        console.log(`\n-----------------------------------------`);
        console.log(`Testing ${s.desc} [${s.tail}]...`);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ANON_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tail_number: s.tail })
            });

            if (res.ok) {
                const data = await res.json();

                console.log(`- Status: 200 OK`);
                console.log(`- Safety Score: ${data.risk_metrics?.safety}/100`);
                console.log(`- NTSB Records Found: ${data.forensic_records?.ntsb_count}`);
                console.log(`- Compliance: ${data.compliance_audit?.status}`);
                console.log(`- Alert Verdict: ${data.ai_intelligence?.audit_verdict}`);
                console.log(`- Risk Profile: ${data.ai_intelligence?.risk_profile}`);

                if (s.tail === 'N799PC') {
                    if (data.ai_intelligence.risk_profile === "WALK AWAY" || data.ai_intelligence.risk_profile === "CAUTION") {
                        console.log("✅ Alert System Triggered (Risk identified)");
                    } else {
                        console.error(`❌ Alert System Failed (Assumed Clean)`);
                    }
                }
            } else {
                console.error(`- Error Status: ${res.status}`);
            }
        } catch (e) {
            console.error(e);
        }
    }
    console.log(`\n-----------------------------------------`);
    console.log("Stress Test Complete.");
};

runTest();
