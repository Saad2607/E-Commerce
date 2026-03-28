const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        orderItems: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                name: String,
                qty: Number,
                price: Number,
                image: String,
            },
        ],

        shippingAddress: {
            address: String,
            city: String,
            postalCode: String,
            country: String,
        },

        paymentMethod: String,

        totalPrice: Number,

        isPaid: { type: Boolean, default: false },
        paidAt: Date,

        isDelivered: { type: Boolean, default: false },
        deliveredAt: Date,

        status: {
            type: String,
            enum: ["Pending", "Shipped", "Out for Delivery", "Delivered"],
            default: "Pending",
        },

        paymentResult: {
            id: String,
            status: String,
            update_time: String,
            email_address: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);