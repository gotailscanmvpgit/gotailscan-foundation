
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

const runMiniTest = async () => {
    console.log("Starting Mini Load Test (100)...");
    let passed = 0;
    let failed = 0;
    for (let i = 0; i < 100; i++) {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ANON_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tail_number: "N" + (10000 + i) })
        });
        if (res.ok) passed++; else failed++;
        if (i % 10 === 0) console.log(`Processed ${i}/100`);
    }
    console.log(`Mini Test Done: ${passed} passed, ${failed} failed`);
};

runMiniTest();
