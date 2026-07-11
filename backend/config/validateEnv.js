const required = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Warning: EMAIL_USER or EMAIL_PASS not set — emails will fail");
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn("Warning: Razorpay keys not set — payments will fail");
    }
};

module.exports = validateEnv;
