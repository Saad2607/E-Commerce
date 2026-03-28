exports.orderTemplate = (order, user) => {
    return `
        <div style="font-family: Arial; padding: 20px;">
            <h2 style="color: #ff9900;">🛒 Order Confirmation</h2>

            <p>Hello <strong>${user.name}</strong>  ,</p>
            <p>Your order has been placed Successfully!</p>

            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> ₹${order.totalPrice}</p>
            <p><strong>Status:</strong> ${order.status}</p>

            <h3>Items:</h3>
            <ul>
                ${order.orderItems
                    .map(
                        (item) =>
                            `<li>${item.name} x ${item.qty} - ₹${item.price}</li>`
                    )
                    .join("")
                }
            </ul>

            <br/>
            <p>Thank you for shopping with us ❤️</p>
        </div>
    `;
};