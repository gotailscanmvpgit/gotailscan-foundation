
const SUPABASE_URL = "https://gwwyzrzbkhnebmslpuzb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE";

console.log("Testing Production Endpoint...");

try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/orchestrateForensicScan`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${ANON_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ tail_number: "N12345" })
    });

    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log("Response Data Preview:", JSON.stringify(data).substring(0, 500) + "...");

        // Assertions for Buyer Logic
        if (data.mission_analysis) console.log("✅ Buyer Logic: Mission Analysis Present");
        else console.error("❌ Buyer Logic: Mission Analysis MISSING");

        // Assertions for Seller Logic
        if (data.ai_intelligence && data.ai_intelligence.tax_strategy) console.log("✅ Seller Logic: Tax Strategy Present");
        else console.error("❌ Seller Logic: Tax Strategy MISSING");

    } else {
        const txt = await res.text();
        console.error("Error Response:", txt);
    }
} catch (err) {
    console.error("Fetch Error:", err);
}
