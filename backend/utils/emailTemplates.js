const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

exports.orderTemplate = (order, user, paymentId) => {
    const itemsHtml = order.orderItems
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.qty * item.price}</td>
            </tr>
        `
        )
        .join("");

    return `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 24px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <tr>
                                <td style="background: #eab308; padding: 28px 32px;">
                                    <h1 style="margin: 0; color: #111827; font-size: 28px;">QuickKart</h1>
                                    <p style="margin: 8px 0 0; color: #374151; font-size: 14px;">Order Confirmation</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 32px;">
                                    <p style="margin: 0 0 8px; color: #111827; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                                    <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
                                        Thank you for your order! Your payment was successful and your invoice is attached as a PDF.
                                    </p>

                                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                                        <tr>
                                            <td style="padding: 16px 20px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Order ID</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${order._id}</p>
                                            </td>
                                            <td style="padding: 16px 20px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Order Date</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${formatDate(order.createdAt || Date.now())}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0 20px 16px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Payment Method</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${order.paymentMethod || "Razorpay"}</p>
                                            </td>
                                            <td style="padding: 0 20px 16px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Payment ID</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${paymentId || "N/A"}</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <h3 style="margin: 0 0 12px; color: #111827;">Order Items</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                                        <thead>
                                            <tr style="background: #111827; color: #ffffff;">
                                                <th style="padding: 12px; text-align: left;">Product</th>
                                                <th style="padding: 12px; text-align: center;">Qty</th>
                                                <th style="padding: 12px; text-align: right;">Price</th>
                                                <th style="padding: 12px; text-align: right;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>${itemsHtml}</tbody>
                                    </table>

                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 16px 20px; background: #fef3c7; border-radius: 12px;">
                                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                                    📎 <strong>Invoice PDF attached</strong> — download and keep it for your records.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="right" style="padding-top: 20px;">
                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Grand Total</p>
                                                <p style="margin: 4px 0 0; color: #111827; font-size: 28px; font-weight: bold;">₹${order.totalPrice}</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 28px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                        We'll notify you when your order is shipped. If you have any questions, reply to this email.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background: #f9fafb; padding: 20px 32px; text-align: center;">
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">© QuickKart — Fast & Smart Shopping</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

exports.orderStatusTemplate = (order, user) => {
    return `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 24px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                            <tr>
                                <td style="background: #eab308; padding: 28px 32px;">
                                    <h1 style="margin: 0; color: #111827; font-size: 28px;">QuickKart</h1>
                                    <p style="margin: 8px 0 0; color: #374151; font-size: 14px;">Order Status Update</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 32px;">
                                    <p style="margin: 0 0 8px; color: #111827; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                                    <p style="margin: 0 0 24px; color: #4b5563; line-height: 1.6;">
                                        Your order status has been updated.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 12px;">
                                        <tr>
                                            <td style="padding: 16px 20px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Order ID</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${order._id}</p>
                                            </td>
                                            <td style="padding: 16px 20px;">
                                                <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; text-transform: uppercase;">New Status</p>
                                                <p style="margin: 0; color: #111827; font-weight: bold;">${order.status}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="background: #f9fafb; padding: 20px 32px; text-align: center;">
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">© QuickKart — Fast & Smart Shopping</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};
