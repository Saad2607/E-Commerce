const nodemailer = require("nodemailer");

// In-memory mock storage for testing
const mockMailbox = [];

const getMockMailbox = () => mockMailbox;
const clearMockMailbox = () => {
    mockMailbox.length = 0;
};

/**
 * Send email via Gmail SMTP
 */
const sendViaGmailSmtp = async (to, subject, html, attachments = []) => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");

    if (!user || !pass) {
        throw new Error("Gmail credentials missing: EMAIL_USER and EMAIL_PASS must be configured");
    }

    const isCustomHost = Boolean(process.env.SMTP_HOST && process.env.SMTP_HOST !== "smtp.gmail.com");

    const transporter = isCustomHost
        ? nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT, 10) || 587,
              secure: process.env.SMTP_SECURE === "true",
              auth: { user, pass },
              tls: { rejectUnauthorized: true },
              connectionTimeout: 10000,
              greetingTimeout: 6000,
              socketTimeout: 12000,
          })
        : nodemailer.createTransport({
              service: "gmail",
              auth: { user, pass },
              tls: { rejectUnauthorized: true },
              connectionTimeout: 10000,
              greetingTimeout: 6000,
              socketTimeout: 12000,
          });

    const fromAddress = process.env.EMAIL_FROM || `"QuickKart" <${user}>`;

    const mailOptions = {
        from: fromAddress,
        to,
        subject,
        html,
        attachments,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Successfully delivered via Gmail SMTP to ${to} (ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId, provider: "smtp" };
    } catch (err) {
        if (
            err.code === "ETIMEDOUT" ||
            err.code === "ENETUNREACH" ||
            err.code === "ECONNREFUSED" ||
            err.message?.toLowerCase().includes("timeout")
        ) {
            throw new Error(
                `SMTP connection timed out (${err.code || "TIMEOUT"}). Note: Render's free tier blocks outbound SMTP ports 465 & 587. If running on Render, consider hosting the backend on Vercel or Railway where Gmail SMTP is fully supported.`
            );
        }
        throw err;
    }
};

/**
 * Universal sendEmail function supporting Gmail SMTP and Mock mode
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

    // 2. Gmail SMTP (Primary)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return await sendViaGmailSmtp(to, subject, html, attachments);
    }

    // 3. If no email configuration provided in development, warn safely
    if (process.env.NODE_ENV === "development") {
        console.warn(`[Email-Warning] No email credentials configured. Email to ${to} was not sent.`);
        return { success: false, messageId: "dev_noop", provider: "none" };
    }

    throw new Error(
        "No email service configured. Please set EMAIL_USER and EMAIL_PASS in your environment variables."
    );
};

module.exports = {
    sendEmail,
    getMockMailbox,
    clearMockMailbox,
};
