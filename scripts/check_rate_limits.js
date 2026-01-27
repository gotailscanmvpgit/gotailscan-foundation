import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

async function main() {
    console.log("🔍 Checking Rate Limits...");
    try {
        const response = await axios.get(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Current Rate Limit (Email Sent):", response.data.rate_limit_email_sent);
        console.log("Other limits invalid/banned:", response.data.rate_limit_verify_factor, response.data.rate_limit_sms_sent);

    } catch (error) {
        console.error("❌ Error fetching config:");
        console.error(error.response?.data || error.message);
    }
}

main();
