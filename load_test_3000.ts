
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

const generateTailNumber = (i: number) => {
    // Mix of N (USA) and C (Canada)
    if (i % 5 === 0) {
        // Generate Canadian: C-FABC, C-Gxyz
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return `C-F${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}`;
    } else {
        // Generate US: N12345, N1AB, etc.
        return `N${Math.floor(Math.random() * 90000) + 10000}`;
    }
};

const runLoadTest = async () => {
    console.log("Starting Load Test: 3000 Tail Numbers...");

    // Generate batch
    const TOTAL = 3000;
    const BATCH_SIZE = 50; // Parallel requests
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batchPromises = [];
        for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL; j++) {
            const tail = generateTailNumber(i + j);
            batchPromises.push(
                fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${ANON_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ tail_number: tail })
                }).then(res => ({ tail, status: res.status, ok: res.ok }))
            );
        }

        const results = await Promise.all(batchPromises);
        results.forEach(r => {
            if (r.ok) passed++;
            else {
                failed++;
                console.error(`Failed: ${r.tail} (${r.status})`);
            }
        });

        console.log(`Processed ${Math.min(i + BATCH_SIZE, TOTAL)}/${TOTAL}. Passed: ${passed}, Failed: ${failed}`);
    }

    console.log(`Test Complete. Total: ${TOTAL}, Passed: ${passed}, Failed: ${failed}`);
};

runLoadTest();
