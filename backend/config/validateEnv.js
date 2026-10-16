const required = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }

    const hasResend = Boolean(process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY);
    const hasSmtp = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (!hasResend && !hasSmtp && process.env.NODE_ENV !== "test") {
        console.warn("Warning: Neither RESEND_API_KEY nor (EMAIL_USER and EMAIL_PASS) is set — transactional emails will fail");
    }

    if (!process.env.OTP_HASH_SECRET) {
        // Fallback to JWT_SECRET is handled safely in otpService, but inform admin
        console.info("Info: OTP_HASH_SECRET not set; falling back to JWT_SECRET for OTP challenge hashing.");
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn("Warning: Razorpay keys not set — payments will fail");
    }
};

module.exports = validateEnv;
