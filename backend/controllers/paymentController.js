const Order = require("../models/Order");
const sendEmail = require("../config/email");

exports.fakePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        // const user = await user.findById(order.user);

        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }

        // simulate payment success
        order.isPaid = true;
        order.paidAt = Date.now();

        order.paymentResult = {
            id: "FAKE_" + Date.now(),
            status: "COMPLETED",
            update_time: new Date().toISOString(),
            email_address: req.user.email
        };

        await order.save();

        await sendEmail(
            req.user.email,
            "Payment Successful 💳",
            `
                <h2>Payment Successful</h2>
                <p>Order ID: ${order._id}</p>
                <p>Status: Paid</p>
                <p>Thank you for shopping with us!</p>
            `
        )

        res.json({
            msg: "Payment Successful",
            order
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};