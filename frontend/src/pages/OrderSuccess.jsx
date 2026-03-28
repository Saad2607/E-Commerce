import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h1 className="text-3xl font-bold text-green-500 mb-4">
                🎉 Order Placed Successfully!
            </h1>

            <p className="mb-6 text-gray-500">
                Thank you for shopping with us ❤️
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate("/")}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Continue Shopping
                </button>

                <button
                    onClick={() => navigate("/my-orders")}
                    className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                    View Orders
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;