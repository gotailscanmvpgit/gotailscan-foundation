import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

const config = {
    smtp_admin_email: 'noreply@gotailscan.com',
    smtp_host: 'smtp.resend.com',
    // Supabase API expects port as a number usually, but the error said "Expected string, received number". 
    // However, some versions of the API might be picky. Let's try passing it as a string as requested by the specific error message.
    smtp_port: '465',
    smtp_user: 'resend',
    smtp_pass: 're_bcf2VZVr_Jzx9pxnQrRt1TJcYGvMBTHDN',
    smtp_sender_name: 'Mission Control',
};

async function main() {
    console.log("🚀 Retry: Connecting to Supabase Mission Control...");
    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ SMTP Configuration Uploaded Successfully!");
        console.log("   - Provider: Resend");
        console.log("   - Sender: Mission Control <noreply@gotailscan.com>");
    } catch (error) {
        console.error("❌ Error updating SMTP:");
        console.error(JSON.stringify(error.response?.data || error.message, null, 2));

        // If it fails again with "Expected number", we will know for sure. 
        // But the previous error was explicit: "Expected string, received number".
    }
}

main();
