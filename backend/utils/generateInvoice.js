const PDFDocument = require("pdfkit");

const generateInvoice = (order, user) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.fontSize(24).fillColor("#eab308").text("QuickKart", { align: "left" });
    doc.fontSize(10).fillColor("#666").text("Fast & Smart Shopping", { align: "left" });
    doc.moveDown();

    doc.fontSize(18).fillColor("#111").text("INVOICE", { align: "right" });
    doc.fontSize(10).fillColor("#666").text(`Order ID: ${order._id}`, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}`, {
        align: "right",
    });
    doc.moveDown(1.5);

    if (user) {
        doc.fontSize(12).fillColor("#111").text("Bill To:", { underline: true });
        doc.fontSize(10).fillColor("#333").text(user.name);
        doc.text(user.email);
        if (order.shippingAddress?.address) {
            doc.text(order.shippingAddress.address);
        }
        doc.moveDown();
    }

    const tableTop = doc.y;
    doc.fontSize(10).fillColor("#fff");
    doc.rect(50, tableTop, 495, 20).fill("#111");
    doc.fillColor("#fff").text("Product", 55, tableTop + 5);
    doc.text("Qty", 300, tableTop + 5);
    doc.text("Price", 380, tableTop + 5);
    doc.text("Total", 460, tableTop + 5);

    let y = tableTop + 25;
    doc.fillColor("#333");

    order.orderItems.forEach((item, index) => {
        const bg = index % 2 === 0 ? "#f9fafb" : "#ffffff";
        doc.rect(50, y - 2, 495, 18).fill(bg);
        doc.fillColor("#333");
        doc.text(item.name, 55, y, { width: 230 });
        doc.text(String(item.qty), 300, y);
        doc.text(`₹${item.price}`, 380, y);
        doc.text(`₹${item.qty * item.price}`, 460, y);
        y += 20;
    });

    doc.moveDown(2);
    y = doc.y;
    doc.fontSize(12).fillColor("#111");
    doc.text(`Payment: ${order.paymentMethod || "Razorpay"}`, 50, y);
    doc.text(`Status: ${order.isPaid ? "Paid" : "Pending"}`, 50, y + 16);
    doc.fontSize(14).text(`Grand Total: ₹${order.totalPrice}`, 380, y + 8, { align: "right" });

    doc.moveDown(3);
    doc.fontSize(9).fillColor("#999").text("Thank you for shopping with QuickKart!", { align: "center" });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);
    });
};

module.exports = generateInvoice;
