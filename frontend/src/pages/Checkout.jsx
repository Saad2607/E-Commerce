import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState("");

    useEffect(() => {
        const fetchCart = async () => {
            const { data } = await API.get("/cart");
            setCart(data);
        };
        fetchCart();
    }, []);

    const totalPrice = cart.reduce(
        (acc, item) => acc + item.product.price * item.qty,
        0
    );

    const placeOrder = async () => {
        if (!address) {
            return toast.error("Please enter shipping address ❌");
        }

        try {
            await API.post("/orders", {
                orderItems: cart,
                shippingAddress: address,
                totalPrice,
            });

            toast.success("Order Placed ✅");
            navigate("/order-success");
        } catch {
            toast.error("Order Failed ❌");
        }
    };

    return (
        <div className="p-6 min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition duration-300">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            <div className="grid grid-cols-3 gap-6">

                {/* 🧾 LEFT SIDE */}
                <div className="col-span-2 space-y-6">

                    {/* 📍 Address */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow transition">
                        <h2 className="font-bold mb-3">Shipping Address</h2>

                        <textarea
                            placeholder="Enter your address..."
                            className="w-full border p-3 rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* 📦 Order Items */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow transition">
                        <h2 className="font-bold mb-3">Order Items</h2>

                        {cart.map((item) => (
                            <div
                                key={item.product._id}
                                className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 py-3"
                            >
                                <div className="flex gap-4 items-center">
                                    <img
                                        src={item.product.images[0]}
                                        alt=""
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            {item.product.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Quantity: {item.qty}
                                        </p>
                                    </div>
                                </div>

                                <p className="font-semibold">
                                    ₹{item.product.price * item.qty}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 💳 RIGHT SIDE */}
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow h-fit transition">
                    <h2 className="font-bold mb-4">Order Summary</h2>

                    <div className="flex justify-between mb-2">
                        <span>Items</span>
                        <span>{cart.length}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                        <span>Total</span>
                        <span className="font-bold">₹{totalPrice}</span>
                    </div>

                    <button
                        onClick={placeOrder}
                        className="bg-yellow-500 hover:bg-yellow-600 w-full py-3 mt-4 rounded font-bold transition"
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;