const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        name: String,
        description: String,
        price: Number,
        images: [String],
        category: String,
        brand: String,
        stock: Number,
        reviews: [reviewSchema],
        numReviews: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        countInStock: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);