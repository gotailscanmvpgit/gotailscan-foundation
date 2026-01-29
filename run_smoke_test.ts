
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

const generateTailNumber = (i: number) => {
    if (i % 3 === 0) {
        // Canadian
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return `C-F${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}`;
    } else {
        // US
        return `N${Math.floor(Math.random() * 90000) + 10000}`;
    }
};

const runSmokeTest = async () => {
    const TOTAL = 10;
    console.log(`Running Smoke Test on ${TOTAL} random tails...`);
    let passed = 0;

    for (let i = 0; i < TOTAL; i++) {
        const tail = generateTailNumber(i);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ANON_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ tail_number: tail })
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`[PASS] ${tail}: ${data.aircraft_details?.make_model || 'Unknown Model'} (Confidence: ${data.confidence_score}%)`);
                passed++;
            } else {
                console.error(`[FAIL] ${tail}: Status ${res.status}`);
            }
        } catch (e) {
            console.error(`[ERR] ${tail}: ${e.message}`);
        }
    }
    console.log(`Smoke Test Complete. ${passed}/${TOTAL} passed.`);
};

runSmokeTest();
