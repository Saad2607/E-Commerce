import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { FaCheckCircle, FaBox } from "react-icons/fa";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!location.state?.paid) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50 text-gray-900 dark:bg-[#0b0f17] dark:text-gray-100 flex items-center justify-center px-4 py-12 hero-pattern transition-colors duration-300">
            <div className="qk-card p-10 sm:p-12 max-w-lg w-full text-center animate-scale-in relative overflow-hidden border-gray-200 dark:border-amber-500/30 shadow-2xl">
                {/* Amber / Gold Top Glow Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />

                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-gold-sm">
                        <FaCheckCircle className="text-5xl text-amber-500 dark:text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                    </div>

                    <div className="flex justify-center gap-2.5 mb-5">
                        {[...Array(5)].map((_, i) => (
                            <FaBox
                                key={i}
                                className="text-amber-500 dark:text-amber-400 animate-bounce"
                                style={{ animationDelay: `${i * 120}ms` }}
                                size={14}
                            />
                        ))}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                        Order <span className="gold-gradient-text">Confirmed!</span>
                    </h1>

                    <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                        Thank you for your purchase with QuickKart.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        A detailed invoice & confirmation email has been dispatched to your inbox.
                    </p>

                    {location.state?.orderId && (
                        <div className="bg-gray-50 dark:bg-[#0b0f17]/90 rounded-xl p-4 mb-8 border border-gray-200 dark:border-gray-800">
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">Confirmed Reference ID</p>
                            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all select-all font-semibold">
                                {location.state.orderId}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => navigate("/")} className="qk-btn-primary flex-1 py-3 text-xs uppercase tracking-wider font-extrabold">
                            Continue Browsing
                        </button>
                        <button onClick={() => navigate("/my-orders")} className="qk-btn-secondary flex-1 py-3 text-xs uppercase tracking-wider font-bold">
                            View My Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
