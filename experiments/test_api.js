
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE';

async function test() {
    console.log("Testing FAA Scraper...");
    try {
        // Updated to query the MAIN orchestrator
        const res = await fetch('https://gwwyzrzbkhnebmslpuzb.supabase.co/functions/v1/orchestrateForensicScan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KEY}`
            },
            body: JSON.stringify({ tail_number: 'N1' })

        });
        const data = await res.json();
        console.log("Result:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
