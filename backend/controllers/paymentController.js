const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../config/email");
const generateInvoice = require("../utils/generateInvoice");
const { orderTemplate } = require("../utils/emailTemplates");

const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys missing in backend .env");
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

exports.createRazorpayOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "Not authorized" });
        }
        if (order.isPaid) {
            return res.status(400).json({ msg: "Order already paid" });
        }
        if (!order.totalPrice || order.totalPrice < 1) {
            return res.status(400).json({ msg: "Order amount must be at least ₹1" });
        }

        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalPrice * 100),
            currency: "INR",
            receipt: `rcpt_${order._id.toString().slice(-16)}_${Date.now()}`,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        const msg =
            error?.error?.description ||
            error?.description ||
            error.message ||
            "Failed to create Razorpay order";
        res.status(500).json({ msg });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ msg: "Invalid payment signature" });
        }

        const existingOrder = await Order.findById(orderId);
        if (!existingOrder) {
            return res.status(404).json({ msg: "Order not found" });
        }
        if (existingOrder.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "Not authorized" });
        }
        if (existingOrder.isPaid) {
            return res.json({ msg: "Payment already verified", order: existingOrder });
        }

        if (
            existingOrder.razorpayOrderId &&
            existingOrder.razorpayOrderId !== razorpay_order_id
        ) {
            return res.status(400).json({ msg: "Invalid Razorpay order" });
        }

        const razorpay = getRazorpay();
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.order_id !== razorpay_order_id) {
            return res.status(400).json({ msg: "Payment order mismatch" });
        }
        if (Number(payment.amount) !== Math.round(existingOrder.totalPrice * 100)) {
            return res.status(400).json({ msg: "Payment amount mismatch" });
        }

        const order = await Order.findOneAndUpdate(
            { _id: orderId, isPaid: false },
            {
                isPaid: true,
                paidAt: Date.now(),
                paymentMethod: "Razorpay",
                razorpayOrderId: razorpay_order_id,
                paymentResult: {
                    id: razorpay_payment_id,
                    status: "COMPLETED",
                    update_time: new Date().toISOString(),
                    email_address: req.user.email,
                },
            },
            { new: true }
        );

        if (!order) {
            const current = await Order.findById(orderId);
            if (current?.isPaid) {
                return res.json({ msg: "Payment already verified", order: current });
            }
            return res.status(404).json({ msg: "Order not found" });
        }

        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.qty },
            });
        }

        const user = await User.findById(req.user._id);
        user.cart = [];
        await user.save();

        try {
            const pdfBuffer = await generateInvoice(order, user);
            await sendEmail(
                user.email,
                "Order Confirmation 🛒 — QuickKart",
                orderTemplate(order, user, razorpay_payment_id),
                [{ filename: `QuickKart-Invoice-${order._id}.pdf`, content: pdfBuffer }]
            );
        } catch (emailErr) {
            console.error("Order confirmation email failed:", emailErr.message);
        }

        res.json({ msg: "Payment verified", order });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
