const mongoose = require("mongoose");

const rateLimitSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        count: {
            type: Number,
            default: 1,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL index for automatic cleanup
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RateLimit", rateLimitSchema);
