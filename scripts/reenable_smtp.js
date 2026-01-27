import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

const config = {
    smtp_admin_email: 'noreply@gotailscan.com',
    smtp_host: 'smtp.resend.com',
    smtp_port: '465', // Standard Secure SMTP
    smtp_user: 'resend',
    smtp_pass: 're_bcf2VZVr_Jzx9pxnQrRt1TJcYGvMBTHDN',
    smtp_sender_name: 'Mission Control',
};

async function main() {
    console.log("🚀 Re-Enabling Custom SMTP (Resend)...");
    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Custom SMTP Active!");
        console.log("   - Domain: gotailscan.com");
        console.log("   - Provider: Resend");
    } catch (error) {
        console.error("❌ Error enabling SMTP:");
        console.error(error.response?.data || error.message);
    }
}

main();
