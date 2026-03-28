import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);

    const fetchCart = async () => {
        const { data } = await API.get("/cart");
        setCart(data);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const removeItem = async (id) => {
        await API.delete(`/cart/${id}`);
        toast.success("Item removed ❌");
        fetchCart();
    };

    const totalPrice = cart.reduce(
        (acc, item) => acc + item.product?.price * item.qty,
        0
    );

    return (
        <div className="p-6 min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition duration-300">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Your cart is empty 🛒
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded"
                    >
                        Go Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-6">

                    {/* 🛒 LEFT: CART ITEMS */}
                    <div className="col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.product?._id}
                                className="flex bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow justify-between items-center transition"
                            >
                                {/* LEFT */}
                                <div className="flex gap-4">
                                    <img
                                        src={item.product?.images?.[0]}
                                        alt=""
                                        className="w-24 h-24 object-cover rounded"
                                    />

                                    <div>
                                        <p className="font-semibold text-lg">
                                            {item.product?.name}
                                        </p>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            ₹{item.product?.price}
                                        </p>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Quantity: {item.qty}
                                        </p>

                                        <button
                                            onClick={() => removeItem(item.product?._id)}
                                            className="text-red-500 text-sm mt-2 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="text-lg font-bold">
                                    ₹{item.product?.price * item.qty}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 📦 RIGHT: ORDER SUMMARY */}
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow h-fit transition">
                        <h2 className="text-xl font-bold mb-4">
                            Order Summary
                        </h2>

                        <div className="flex justify-between mb-2">
                            <span>Items:</span>
                            <span>{cart.length}</span>
                        </div>

                        <div className="flex justify-between mb-4">
                            <span>Total:</span>
                            <span className="font-bold">₹{totalPrice}</span>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="bg-yellow-500 hover:bg-yellow-600 w-full py-3 rounded-lg font-semibold"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;