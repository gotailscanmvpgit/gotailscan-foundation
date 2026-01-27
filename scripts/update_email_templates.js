import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'gwwyzrzbkhnebmslpuzb';
const API_URL = 'https://api.supabase.com/v1';
const PAT = 'sbp_d50b7129f44a5db01080f4b11abcdd897d0aa820';

const TEMPLATE_PATH = path.join(__dirname, '../branded_email_template.html');

function generateTemplate(baseHtml, title, message, buttonText) {
    let html = baseHtml;
    // Replace Title
    html = html.replace('<h1>CONFIRM YOUR ACCESS</h1>', `<h1>${title}</h1>`);
    // Replace Body (Need to match the specific paragraph or just replace the whole block)
    // The current file has: <p>You have requested access to the <strong>GoTailScan</strong> hangar. To proceed with your authentication and unlock full platform capabilities, please verify your email address.</p>
    const originalBody = 'You have requested access to the <strong>GoTailScan</strong> hangar. To proceed with your authentication and unlock full platform capabilities, please verify your email address.';
    html = html.replace(originalBody, message);

    // Replace Button Text
    html = html.replace('>CONFIRM EMAIL<', `>${buttonText}<`);

    return html;
}

async function main() {
    console.log("🎨 Generatng Branded Templates...");

    let baseHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

    // 1. Confirmation
    const confirmationHtml = baseHtml; // Default content matches

    // 2. Recovery
    const recoveryHtml = generateTemplate(
        baseHtml,
        "RESET CREDENTIALS",
        "We received a request to reset the password for your Mission Control account. If you did not make this request, please ignore this transmission.",
        "RESET PASSWORD"
    );

    // 3. Magic Link
    const magicLinkHtml = generateTemplate(
        baseHtml,
        "MAGIC LINK ACCESS",
        "Click the button below to sign in to your GoTailScan Mission Control immediately without a password.",
        "SIGN IN NOW"
    );

    // 4. Invite
    const inviteHtml = generateTemplate(
        baseHtml,
        "MISSION INVITE",
        "You have been invited to join the GoTailScan platform. Accept this invitation to access aircraft intelligence data.",
        "ACCEPT INVITATION"
    );

    // 5. Email Change
    const emailChangeHtml = generateTemplate(
        baseHtml,
        "CONFIRM EMAIL UPDATE",
        "We received a request to update the email address associated with your account. Please confirm this change to maintain secure access.",
        "CONFIRM CHANGE"
    );

    const config = {
        // Confirmation
        mailer_subjects_confirmation: "✈️ Confirm your access to GoTailScan Hangar",
        mailer_templates_confirmation_content: confirmationHtml,

        // Recovery
        mailer_subjects_recovery: "🔐 Reset your Mission Control credentials",
        mailer_templates_recovery_content: recoveryHtml,

        // Magic Link
        mailer_subjects_magic_link: "✨ Log in to GoTailScan",
        mailer_templates_magic_link_content: magicLinkHtml,

        // Invite
        mailer_subjects_invite: "🎟️ You have been invited to GoTailScan",
        mailer_templates_invite_content: inviteHtml,

        // Email Change
        mailer_subjects_email_change: "🔄 Confirm your new email address",
        mailer_templates_email_change_content: emailChangeHtml,
    };

    console.log("🚀 Uploading Templates to Supabase...");

    try {
        await axios.patch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, config, {
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ All Email Templates Updated Successfully!");
    } catch (error) {
        console.error("❌ Error updating templates:");
        console.error(error.response?.data || error.message);
    }
}

main();
