const PDFDocument = require("pdfkit");

const generateInvoice = (order) => {
    const doc = new PDFDocument();

    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.fontSize(20).text("Invoice", { align: "center" });

    doc.text(`Order ID: ${order._id}`);
    doc.text(`Total: ₹${order.totalPrice}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();

    order.orderItems.forEach((item) => {
        doc.text(`${item.name} - ${item.qty} x ₹${item.price}`);
    });

    doc.end();

    return new Promise((resolve) => {
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
    });
};

module.exports = generateInvoice;