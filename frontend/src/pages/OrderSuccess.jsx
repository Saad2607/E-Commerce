import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { FaCheckCircle, FaBox } from "react-icons/fa";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!location.state?.paid) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 hero-pattern">
            <div className="qk-card p-10 sm:p-12 max-w-md w-full text-center animate-scale-in relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400" />

                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 ring-4 ring-green-200 dark:ring-green-800">
                        <FaCheckCircle className="text-5xl text-green-500" />
                    </div>

                    <div className="flex justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <FaBox
                                key={i}
                                className="text-yellow-400 animate-bounce"
                                style={{ animationDelay: `${i * 100}ms` }}
                                size={14}
                            />
                        ))}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Order Placed!
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Thank you for shopping with QuickKart ❤️
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        A confirmation email with your invoice has been sent.
                    </p>

                    {location.state?.orderId && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-8">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all">
                                {location.state.orderId}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => navigate("/")} className="qk-btn-primary flex-1 py-2.5">
                            Continue Shopping
                        </button>
                        <button onClick={() => navigate("/my-orders")} className="qk-btn-secondary flex-1 py-2.5">
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
