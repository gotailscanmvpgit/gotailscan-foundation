
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

const generateTailNumber = (i: number) => {
    if (i % 5 === 0) {
        // Canadian: C-FABC
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return `C-F${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}${chars[Math.floor(Math.random() * 26)]}`;
    } else {
        // US: N12345
        return `N${Math.floor(Math.random() * 90000) + 10000}`;
    }
};

const runLoadTest = async () => {
    const TOTAL = 10000;
    const BATCH_SIZE = 5;
    console.log(`Starting Scale Load Test: ${TOTAL} Tail Numbers (Batch: ${BATCH_SIZE})...`);

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const start = Date.now();
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
                })
                    .then(res => ({ tail, status: res.status, ok: res.ok }))
                    .catch(err => {
                        console.error(`- Error for ${tail}: ${err.message}`);
                        return { tail, status: 500, ok: false };
                    })
            );
        }

        const results = await Promise.all(batchPromises);
        results.forEach(r => {
            if (r.ok) passed++;
            else failed++;
        });

        const duration = Date.now() - start;
        if ((i + BATCH_SIZE) % 50 === 0) {
            console.log(`[${new Date().toISOString()}] Processed ${Math.min(i + BATCH_SIZE, TOTAL)}/${TOTAL}. Batch took ${duration}ms. Passed: ${passed}, Failed: ${failed}`);
        }
    }

    console.log(`Test Complete. Total: ${TOTAL}, Passed: ${passed}, Failed: ${failed}`);
};

runLoadTest();
