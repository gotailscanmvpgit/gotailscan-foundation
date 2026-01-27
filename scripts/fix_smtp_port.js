import axios from 'axios';

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

// Config to switch to Port 587 (STARTTLS) which is often more reliable
// for external SMTP services if 465 fails due to handshake timeout.
const config = {
    smtp_host: 'smtp.resend.com',
    smtp_port: '587',
    smtp_user: 'resend',
    smtp_pass: 're_bcf2VZVr_Jzx9pxnQrRt1TJcYGvMBTHDN', // Re-sending creds just to be sure
    smtp_sender_name: 'Mission Control',
    smtp_admin_email: 'noreply@gotailscan.com',
};

async function main() {
    console.log("🔧 Tuning SMTP Frequency (Switching to Port 587)...");
    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ SMTP Port Updated to 587.");
    } catch (error) {
        console.error("❌ Error updating SMTP:");
        console.error(error.response?.data || error.message);
    }
}

main();
