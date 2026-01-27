import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

async function main() {
    console.log("🔍 Fetching Supabase Auth Config Templates...");
    try {
        const response = await axios.get(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("--- Confirmation Template ---");
        console.log(response.data.mailer_templates_confirmation_content);

        console.log("\n--- Magic Link Template ---");
        console.log(response.data.mailer_templates_magic_link_content);

        console.log("\n--- Recovery Template ---");
        console.log(response.data.mailer_templates_recovery_content);

    } catch (error) {
        console.error(error);
    }
}

main();
