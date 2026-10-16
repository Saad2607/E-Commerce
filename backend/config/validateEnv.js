const required = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }

    const hasSmtp = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (!hasSmtp && process.env.NODE_ENV !== "test") {
        console.warn("Warning: EMAIL_USER and EMAIL_PASS are not configured — transactional emails will fail");
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
