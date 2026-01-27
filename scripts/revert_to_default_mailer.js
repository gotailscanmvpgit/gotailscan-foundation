import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

async function main() {
    console.log("↩️  Reverting to Default Supabase Mailer...");

    // To disable custom SMTP, we usually just need to clear these fields
    // or set a flag if one existed (but usually it's just presence of fields).
    // Note: sending null or empty strings for these values.
    const config = {
        smtp_host: null,
        smtp_user: null,
        smtp_pass: null,
        smtp_port: null,
        smtp_sender_name: null,
        smtp_admin_email: null,
    };

    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Custom SMTP Disabled. Now using default Supabase delivery.");
        console.log("   (Emails will arrive, but labeled 'via supabase.co')");
    } catch (error) {
        console.error("❌ Error reverting SMTP:");
        console.error(error.response?.data || error.message);
    }
}

main();
