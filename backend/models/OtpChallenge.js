const mongoose = require("mongoose");

const otpChallengeSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        purpose: {
            type: String,
            required: true,
            enum: ["register", "forgot-password", "otp-login", "change-email"],
            index: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        targetEmail: {
            type: String,
            lowercase: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        attempts: {
            type: Number,
            default: 0,
        },
        maxAttempts: {
            type: Number,
            default: 5,
        },
        consumed: {
            type: Boolean,
            default: false,
            index: true,
        },
        consumedAt: {
            type: Date,
        },
        lastSentAt: {
            type: Date,
            default: Date.now,
        },
        sendCount: {
            type: Number,
            default: 1,
        },
        ip: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // MongoDB TTL index for automatic cleanup
        },
    },
    { timestamps: true }
);

// Compound index for finding active challenges
otpChallengeSchema.index({ identifier: 1, purpose: 1, consumed: 1, expiresAt: 1 });

module.exports = mongoose.model("OtpChallenge", otpChallengeSchema);
