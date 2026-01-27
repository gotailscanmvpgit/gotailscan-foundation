import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

async function main() {
    console.log("🔍 Fetching Supabase Auth Config...");
    try {
        const response = await axios.get(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Config Retrieved!");
        // Print keys to filter for template related ones
        const keys = Object.keys(response.data);
        const templateKeys = keys.filter(k => k.includes('template') || k.includes('email') || k.includes('body'));
        console.log("Template/Email Keys found:", templateKeys);
        console.log("\nFull Config Sample (first 5 keys):", keys.slice(0, 5));

        // Let's see the specific structure for confirmation email
        if (response.data.WEBSITE_URL) console.log("Website URL:", response.data.WEBSITE_URL);
    } catch (error) {
        console.error("❌ Error fetching config:");
        console.error(error.response?.data || error.message);
    }
}

main();
