const nodemailer = require("nodemailer");

const getEmailConfig = () => {
    const user = process.env.EMAIL_USER?.trim();
    // Gmail app passwords are 16 chars — remove spaces if copied with gaps
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, "");

    if (!user || !pass) {
        throw new Error("EMAIL_USER and EMAIL_PASS must be set in backend .env");
    }

    return { user, pass };
};

const createTransporter = () => {
    const { user, pass } = getEmailConfig();

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: true },
    });
};

const sendEmail = async (to, subject, html, attachments = []) => {
    const { user } = getEmailConfig();

    const transporter = createTransporter();

    // Verify SMTP connection before sending
    await transporter.verify();

    const mailOptions = {
        from: `"QuickKart" <${user}>`,
        to,
        subject,
        html,
        attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} — messageId: ${info.messageId}`);
    return true;
};

module.exports = sendEmail;
