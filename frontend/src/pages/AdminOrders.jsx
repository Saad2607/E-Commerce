import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            const { data } = await API.get("/orders", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            setOrders(data);
        } catch (error) {
            console.log(error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            await API.put(
                `/orders/${id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            toast.success("Status Updated ✅");
        } catch (error) {
            toast.error("Error Updating ❌");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Orders</h1>

            {orders.map((order) => (
                <div key={order._id} className="border p-4 mb-4 rounded shadow">
                    <p><b>User:</b> {order.user?.name}</p>
                    <p><b>Total:</b> ₹{order.totalPrice}</p>

                    <div className="flex items-center gap-3 mt-2">
                        <b>Status: </b>
                        <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="border p-1"
                        >
                            <option>Pending</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                        </select>
                    </div>

                    <div className="mt-3">
                        {order.orderItems.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 mb-2">
                                <img
                                    src={item.product?.images?.[0]}
                                    alt=""
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <p>{item.product?.name} x {item.qty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminOrders;