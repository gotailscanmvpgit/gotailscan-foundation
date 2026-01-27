import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

async function main() {
    console.log("🚀 Boosting Rate Limits...");

    // According to docs/experience, this is usually per hour.
    // Increasing to 50 should clear the bottleneck for testing.
    const config = {
        rate_limit_email_sent: 50,
    };

    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Rate Limit increased to 50 emails/hour!");
    } catch (error) {
        console.error("❌ Error updating rate limits:");
        console.error(error.response?.data || error.message);
    }
}

main();
