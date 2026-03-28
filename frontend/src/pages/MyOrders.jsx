import { useEffect, useState } from "react";
import API from "../services/api";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));

                const { data } = await API.get("/orders/my", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                setOrders(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.map((order) => (
                <div key={order._id} className="rounded-lg shadow mb-6 bg-white dark:bg-gray-800">

                    {/* Header */}
                    <div className="flex justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg">
                        <p className="text-sm">Order ID: {order._id}</p>
                        <p className={`font-bold ${order.status === "Pending" ? "text-yellow-500" :
                                order.status === "Shipped" ? "text-blue-500" :
                                    "text-green-500"
                            }`}>
                            {order.status}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="p-4">
                        {order.orderItems.map((item) => (
                            <div key={item._id} className="flex items-center gap-4 mb-3 border-b pb-3">
                                <img
                                    src={item.product?.images?.[0]}
                                    className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{item.product?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.qty}
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    ₹{item.product?.price}
                                </p>
                            </div>
                        ))}

                        <div className="text-right font-bold mt-2">
                            Total: ₹{order.totalPrice}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyOrders;