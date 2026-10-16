const nodemailer = require("nodemailer");

// In-memory mock storage for testing
const mockMailbox = [];

const getMockMailbox = () => mockMailbox;
const clearMockMailbox = () => {
    mockMailbox.length = 0;
};

/**
 * Send email via Resend HTTPS REST API (Bypasses Render SMTP port blocking)
 */
const sendViaResend = async (apiKey, to, subject, html, attachments = []) => {
    const fromAddress = process.env.EMAIL_FROM || "QuickKart <onboarding@resend.dev>";

    // Format attachments for Resend REST API
    const formattedAttachments = attachments.map((att) => {
        let contentBase64;
        if (Buffer.isBuffer(att.content)) {
            contentBase64 = att.content.toString("base64");
        } else if (typeof att.content === "string") {
            contentBase64 = Buffer.from(att.content).toString("base64");
        } else {
            contentBase64 = "";
        }
        return {
            filename: att.filename,
            content: contentBase64,
        };
    });

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            ...(formattedAttachments.length > 0 && { attachments: formattedAttachments }),
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMsg = data?.message || data?.error?.message || `Resend API returned status ${response.status}`;
        throw new Error(`Email delivery failed (Resend): ${errorMsg}`);
    }

    console.log(`[Email] Successfully delivered via Resend to ${to} (ID: ${data.id})`);
    return { success: true, messageId: data.id, provider: "resend" };
};

/**
 * Send email via Nodemailer SMTP (Default for local development)
 */
const sendViaSmtp = async (to, subject, html, attachments = []) => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");

    if (!user || !pass) {
        throw new Error("SMTP credentials missing: EMAIL_USER and EMAIL_PASS must be configured");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
        tls: { rejectUnauthorized: true },
        family: 4,
    });

    const fromAddress = process.env.EMAIL_FROM || `"QuickKart" <${user}>`;

    const mailOptions = {
        from: fromAddress,
        to,
        subject,
        html,
        attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Successfully delivered via SMTP to ${to} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, provider: "smtp" };
};

/**
 * Universal sendEmail function supporting Resend HTTPS API, Nodemailer SMTP, and Mock mode
 */
const sendEmail = async (to, subject, html, attachments = []) => {
    const provider = process.env.EMAIL_PROVIDER?.toLowerCase()?.trim();
    const isTestMode = process.env.NODE_ENV === "test" || provider === "mock";

    // 1. Mock mode for tests
    if (isTestMode) {
        const mockItem = {
            to,
            subject,
            html,
            attachmentsCount: attachments.length,
            sentAt: new Date(),
        };
        mockMailbox.push(mockItem);
        console.log(`[Email-Mock] Recorded email to ${to} with subject "${subject}"`);
        return { success: true, messageId: `mock_${Date.now()}`, provider: "mock" };
    }

    // 2. HTTPS API via Resend (Preferred for Render cloud deployment)
    const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
    if (provider === "resend" || (resendKey && provider !== "smtp")) {
        if (!resendKey) {
            throw new Error("RESEND_API_KEY must be set when EMAIL_PROVIDER=resend");
        }
        return await sendViaResend(resendKey, to, subject, html, attachments);
    }

    // 3. Nodemailer SMTP (Default local fallback)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return await sendViaSmtp(to, subject, html, attachments);
    }

    // 4. If no email configuration provided in development, warn safely
    if (process.env.NODE_ENV === "development") {
        console.warn(`[Email-Warning] No email credentials configured. Email to ${to} was not sent.`);
        return { success: false, messageId: "dev_noop", provider: "none" };
    }

    throw new Error(
        "No email service configured. Please provide RESEND_API_KEY or EMAIL_USER and EMAIL_PASS."
    );
};

module.exports = {
    sendEmail,
    getMockMailbox,
    clearMockMailbox,
};
