import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import AuthCard from "../components/AuthCard";

const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            return showError("Please enter your email ❌");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/forgot-password", { email });
            showSuccess(data.msg || "If an eligible account exists, a reset code was sent 📩");
            navigate("/verify-reset-otp", { state: { email } });
        } catch (err) {
            const message =
                err.response?.data?.msg ||
                err.response?.statusText ||
                err.message ||
                "Something went wrong ❌";
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Forgot Password"
            subtitle="Enter your email and we'll send you a 6-digit reset code"
            footer={
                <>
                    Remember your password?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
                    >
                        Back to Login
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        className={inputClass}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg disabled:opacity-60"
                >
                    {loading ? "Sending..." : "Send Verification Code"}
                </button>
            </form>
        </AuthCard>
    );
};

export default ForgotPassword;
