const crypto = require("crypto");
const OtpChallenge = require("../models/OtpChallenge");
const RateLimit = require("../models/RateLimit");

const getOtpSecret = () => {
    return process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "default_quickkart_otp_secret_key";
};

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
const generateNumericOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Compute keyed HMAC of purpose, normalized identifier, and OTP
 */
const hashOtp = (purpose, identifier, otp) => {
    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const payload = `${purpose}:${normalizedIdentifier}:${String(otp).trim()}`;
    return crypto.createHmac("sha256", getOtpSecret()).update(payload).digest("hex");
};

/**
 * Distributed MongoDB-backed rate limiter for rolling windows
 */
const checkRateLimit = async (key, maxCount, windowSeconds) => {
    try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

        const record = await RateLimit.findOneAndUpdate(
            { key },
            {
                $inc: { count: 1 },
                $setOnInsert: { expiresAt },
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        if (record.count > maxCount) {
            return {
                allowed: false,
                retryAfterSeconds: Math.max(1, Math.ceil((record.expiresAt.getTime() - Date.now()) / 1000)),
            };
        }

        return { allowed: true };
    } catch (err) {
        // Fallback gracefully if database rate limiting encounters an error
        console.error("Rate limit check warning:", err.message);
        return { allowed: true };
    }
};

/**
 * Create a new OTP challenge and invalidate any existing active challenges for this purpose & identifier
 */
const createOtpChallenge = async ({
    identifier,
    purpose,
    targetEmail,
    userId,
    ip,
    userAgent,
}) => {
    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const cooldownSeconds = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60;
    const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES, 10) || 5;
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;

    // Check resend cooldown on the most recent challenge
    const latestChallenge = await OtpChallenge.findOne({
        identifier: normalizedIdentifier,
        purpose,
        consumed: false,
    }).sort({ createdAt: -1 });

    if (latestChallenge && latestChallenge.lastSentAt) {
        const elapsedSeconds = Math.floor((Date.now() - new Date(latestChallenge.lastSentAt).getTime()) / 1000);
        if (elapsedSeconds < cooldownSeconds) {
            const waitTime = cooldownSeconds - elapsedSeconds;
            const error = new Error(`Please wait ${waitTime} seconds before requesting a new code.`);
            error.statusCode = 429;
            error.cooldownRemaining = waitTime;
            throw error;
        }
    }

    // Rate limiting: max 4 OTP requests per 15 minutes per email/identifier
    const emailLimit = await checkRateLimit(`otp:email:${normalizedIdentifier}:${purpose}`, 4, 15 * 60);
    if (!emailLimit.allowed) {
        const error = new Error(`Too many verification requests. Please try again in ${Math.ceil(emailLimit.retryAfterSeconds / 60)} minutes.`);
        error.statusCode = 429;
        throw error;
    }

    // Rate limiting: max 12 OTP requests per hour per IP (if IP provided and not in test mode)
    if (ip && process.env.NODE_ENV !== "test") {
        const ipLimit = await checkRateLimit(`otp:ip:${ip}`, 12, 60 * 60);
        if (!ipLimit.allowed) {
            const error = new Error(`Too many requests from this network. Please try again later.`);
            error.statusCode = 429;
            throw error;
        }
    }

    // Invalidate existing active challenges for this purpose and identifier
    await OtpChallenge.updateMany(
        { identifier: normalizedIdentifier, purpose, consumed: false },
        { $set: { consumed: true, consumedAt: new Date() } }
    );

    const otp = generateNumericOtp();
    const otpHash = hashOtp(purpose, normalizedIdentifier, otp);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const challenge = await OtpChallenge.create({
        identifier: normalizedIdentifier,
        purpose,
        otpHash,
        targetEmail: targetEmail ? String(targetEmail).trim().toLowerCase() : undefined,
        userId: userId || undefined,
        expiresAt,
        maxAttempts,
        ip,
        userAgent,
        lastSentAt: new Date(),
    });

    return {
        otp, // Only returned to caller (controller) for emailing to user. Never sent in API response!
        challengeId: challenge._id,
        expiresAt,
        cooldownSeconds,
    };
};

/**
 * Verify and atomically consume an OTP challenge
 */
const verifyAndConsumeOtp = async ({ identifier, purpose, otp }) => {
    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const cleanedOtp = String(otp || "").trim();

    if (!cleanedOtp || cleanedOtp.length !== 6 || !/^\d{6}$/.test(cleanedOtp)) {
        return {
            success: false,
            reason: "INVALID_FORMAT",
            message: "Verification code must be exactly 6 numeric digits.",
        };
    }

    // Find the latest active challenge for this identifier and purpose
    const challenge = await OtpChallenge.findOne({
        identifier: normalizedIdentifier,
        purpose,
        consumed: false,
    }).sort({ createdAt: -1 });

    if (!challenge) {
        return {
            success: false,
            reason: "NOT_FOUND",
            message: "No active verification code found. Please request a new code.",
        };
    }

    // Check expiration
    if (new Date() > new Date(challenge.expiresAt)) {
        return {
            success: false,
            reason: "EXPIRED",
            message: "Verification code has expired. Please request a new code.",
        };
    }

    // Check attempt limits
    if (challenge.attempts >= challenge.maxAttempts) {
        return {
            success: false,
            reason: "MAX_ATTEMPTS_EXCEEDED",
            message: "Too many failed attempts. This code is now invalid. Please request a new code.",
        };
    }

    // Calculate expected hash
    const expectedHash = hashOtp(purpose, normalizedIdentifier, cleanedOtp);

    // Timing-safe comparison to prevent side-channel timing attacks
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const storedBuffer = Buffer.from(challenge.otpHash, "hex");

    const isMatch =
        expectedBuffer.length === storedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, storedBuffer);

    if (!isMatch) {
        const updatedChallenge = await OtpChallenge.findByIdAndUpdate(
            challenge._id,
            { $inc: { attempts: 1 } },
            { new: true }
        );

        const remainingAttempts = Math.max(0, updatedChallenge.maxAttempts - updatedChallenge.attempts);

        if (remainingAttempts === 0) {
            // Invalidate on reaching max attempts
            await OtpChallenge.findByIdAndUpdate(challenge._id, {
                consumed: true,
                consumedAt: new Date(),
            });
            return {
                success: false,
                reason: "MAX_ATTEMPTS_EXCEEDED",
                message: "Invalid verification code. Maximum attempts reached. Please request a new code.",
            };
        }

        return {
            success: false,
            reason: "INVALID_OTP",
            message: `Invalid verification code. ${remainingAttempts} ${remainingAttempts === 1 ? "attempt" : "attempts"} remaining.`,
            remainingAttempts,
        };
    }

    // Atomic consumption: ensure challenge was not consumed concurrently
    const consumedChallenge = await OtpChallenge.findOneAndUpdate(
        { _id: challenge._id, consumed: false },
        {
            $set: {
                consumed: true,
                consumedAt: new Date(),
            },
        },
        { returnDocument: 'after' }
    );

    if (!consumedChallenge) {
        return {
            success: false,
            reason: "ALREADY_CONSUMED",
            message: "This verification code has already been used.",
        };
    }

    return {
        success: true,
        challenge: consumedChallenge,
    };
};

module.exports = {
    generateNumericOtp,
    hashOtp,
    checkRateLimit,
    createOtpChallenge,
    verifyAndConsumeOtp,
};
