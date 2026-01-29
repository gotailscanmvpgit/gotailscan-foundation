
const fetch = require('node-fetch');

async function test() {
    console.log("Testing Local Orchestrator for N000DQ...");
    try {
        const res = await fetch('http://localhost:54321/functions/v1/orchestrateForensicScan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (process.env.SUPABASE_ANON_KEY || 'no-key-needed-local')
            },
            body: JSON.stringify({ tail_number: 'N000DQ' })
        });

        if (!res.ok) {
            console.error("HTTP Error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Body:", text);
            return;
        }

        const data = await res.json();
        console.log("--- Dormancy Analysis ---");
        console.log(JSON.stringify(data.dormancy_analysis, null, 2));

        console.log("\n--- Risk Metrics ---");
        console.log(JSON.stringify(data.risk_metrics, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
