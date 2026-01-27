import fs from 'fs';
import readline from 'readline';
import axios from 'axios';

// Project Reference from your linked project
const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log("\x1b[36m%s\x1b[0m", "\n✈️  GoTailScan Production Email Setup  ✈️");
    console.log("---------------------------------------");
    console.log("This script helps you configure Custom SMTP for your Supabase project.");
    console.log("You will need a Supabase Personal Access Token.");
    console.log("Create one here: https://supabase.com/dashboard/account/tokens\n");

    const pat = await ask("🔑 Enter Supabase Personal Access Token: ");

    if (!pat) {
        console.log("❌ Token required. Exiting.");
        rl.close();
        return;
    }

    console.log("\n\x1b[33m%s\x1b[0m", "--- SMTP Configuration ---");
    console.log("To remove 'via supabase.co' from your emails, you need an SMTP provider.");
    console.log("Recommended: Resend, SendGrid, Mailgun, or AWS SES.");

    const useSMTP = await ask("❓ Do you want to configure SMTP settings now? (y/n): ");

    if (useSMTP.toLowerCase().startsWith('y')) {
        const host = await ask("   Host (e.g., smtp.resend.com): ");
        const port = await ask("   Port (e.g., 465): ");
        const user = await ask("   User (e.g., resend): ");
        const pass = await ask("   Password: ");
        const sender = await ask("   Sender Email (e.g., noreply@gotailscan.com): ");
        const senderName = await ask("   Sender Name (e.g., Mission Control): ");

        try {
            console.log("\n🚀 Connecting to Supabase Mission Control...");

            // Note: Endpoint for updating Auth Config
            // https://api.supabase.com/v1/projects/{ref}/config/auth
            const response = await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
                smtp_admin_email: sender,
                smtp_host: host,
                smtp_port: parseInt(port),
                smtp_user: user,
                smtp_pass: pass,
                smtp_sender_name: senderName,
            }, {
                headers: {
                    'Authorization': `Bearer ${pat}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("\x1b[32m%s\x1b[0m", "✅ SMTP Configuration Uploaded Successfully!");
        } catch (error) {
            console.error("\x1b[31m%s\x1b[0m", "❌ Error updating SMTP:");
            console.error(error.response?.data || error.message);
        }
    } else {
        console.log("Skipping SMTP setup.");
    }

    console.log("\n\x1b[33m%s\x1b[0m", "--- 📧 Email Template Instructions ---");
    console.log("To apply the G1000 Branding:");
    console.log("1. We have created 'branded_email_template.html' in your project root.");
    console.log("2. Go to: https://supabase.com/dashboard/project/" + PROJECT_REF + "/auth/templates");
    console.log("3. Select 'Confirm Verification' (and others).");
    console.log("4. Paste the HTML content.");
    console.log("\nDone! 🏁");

    rl.close();
}

main();
