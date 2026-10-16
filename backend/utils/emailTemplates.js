const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

/**
 * Common QuickKart email wrapper
 */
const emailWrapper = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
        ${preheader || title}
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #111827; padding: 28px 32px; text-align: left; border-bottom: 3px solid #eab308;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                                            Quick<span style="color: #eab308;">Kart</span>
                                        </h1>
                                        <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">Fast & Smart Shopping</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 36px 32px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                                This is an automated security notification from QuickKart.<br>
                                If you did not request this, please secure your account immediately.
                            </p>
                            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} QuickKart — Fast & Smart Shopping. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * OTP Verification Email Template
 */
exports.otpEmailTemplate = ({ otp, purpose, expiryMinutes = 5 }) => {
    let title = "Verification Code";
    let heading = "Verify your account";
    let message = "Use the verification code below to complete your verification:";
    let instruction = "This code will expire in " + expiryMinutes + " minutes.";

    if (purpose === "register") {
        title = "QuickKart — Verify Your Email";
        heading = "Welcome to QuickKart!";
        message = "Thank you for registering with QuickKart. Enter the code below to verify your email address:";
    } else if (purpose === "forgot-password") {
        title = "QuickKart — Password Reset Code";
        heading = "Password Reset Request";
        message = "We received a request to reset your QuickKart password. Use this verification code to proceed:";
    } else if (purpose === "otp-login") {
        title = "QuickKart — Login Verification Code";
        heading = "Sign In with One-Time Code";
        message = "Here is your one-time verification code to sign in to your QuickKart account:";
    } else if (purpose === "change-email") {
        title = "QuickKart — Confirm Email Change";
        heading = "Verify Your New Email";
        message = "We received a request to change your QuickKart account email to this address. Use this code to confirm:";
    }

    const content = `
        <h2 style="margin: 0 0 12px; color: #111827; font-size: 22px; font-weight: 700;">${heading}</h2>
        <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
            ${message}
        </p>

        <!-- OTP Display Box -->
        <div style="background-color: #fefce8; border: 2px dashed #eab308; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #854d0e; font-weight: 600;">
                Your Verification Code
            </p>
            <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #111827; font-family: monospace;">
                ${otp}
            </div>
            <p style="margin: 8px 0 0; color: #854d0e; font-size: 13px;">
                ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> only
            </p>
        </div>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; border-left: 4px solid #eab308;">
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
                🔒 <strong>Security Tip:</strong> Never share this code with anyone. QuickKart staff will never ask for your verification code.
            </p>
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
            If you did not request this code, no action is needed. Your account remains safe.
        </p>
    `;

    return emailWrapper({ title, preheader: `Your QuickKart code is ${otp}`, content });
};

/**
 * Password Changed Notification Template
 */
exports.passwordChangedTemplate = ({ name }) => {
    const content = `
        <h2 style="margin: 0 0 12px; color: #111827; font-size: 22px; font-weight: 700;">Password Changed Successfully</h2>
        <p style="margin: 0 0 16px; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Hello <strong>${name || "Customer"}</strong>,
        </p>
        <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
            This email confirms that the password for your QuickKart account was recently changed. Any previously active sessions have been invalidated for your security.
        </p>

        <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                ⚠️ Did not make this change?
            </p>
            <p style="margin: 6px 0 0; color: #b91c1c; font-size: 13px; line-height: 1.5;">
                If you did not change your password, someone may have unauthorized access to your account. Please reset your password immediately via our Forgot Password page.
            </p>
        </div>

        <p style="margin: 0; color: #6b7280; font-size: 13px;">
            Changed at: <strong>${formatDate(Date.now())}</strong>
        </p>
    `;

    return emailWrapper({
        title: "QuickKart — Password Changed",
        preheader: "Your QuickKart account password was recently changed.",
        content,
    });
};

/**
 * Email Changed Notification Template
 */
exports.emailChangedTemplate = ({ name, oldEmail, newEmail }) => {
    const content = `
        <h2 style="margin: 0 0 12px; color: #111827; font-size: 22px; font-weight: 700;">Account Email Changed</h2>
        <p style="margin: 0 0 16px; color: #4b5563; font-size: 15px; line-height: 1.6;">
            Hello <strong>${name || "Customer"}</strong>,
        </p>
        <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">
            The email address associated with your QuickKart account has been updated from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.
        </p>

        <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                ⚠️ Did not authorize this change?
            </p>
            <p style="margin: 6px 0 0; color: #b91c1c; font-size: 13px; line-height: 1.5;">
                If you did not request this update, please contact support or reset your password immediately.
            </p>
        </div>
    `;

    return emailWrapper({
        title: "QuickKart — Account Email Updated",
        preheader: "Your QuickKart account email address has been updated.",
        content,
    });
};

/**
 * Existing Order Confirmation Template (Preserved exactly)
 */
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

/**
 * Existing Order Status Template (Preserved exactly)
 */
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
