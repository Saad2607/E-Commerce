import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthCard from "../components/AuthCard";

const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            return toast.error("Please fill all fields ❌");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters ❌");
        }
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match ❌");
        }

        setLoading(true);
        try {
            await API.put(`/auth/reset-password/${token}`, { password });
            toast.success("Password reset successful ✅");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.msg || "Reset failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Reset Password"
            subtitle="Choose a strong new password for your account"
            footer={
                <>
                    Go back to{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
                    >
                        Login
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            className={`${inputClass} pr-11`}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            className={`${inputClass} pr-11`}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </AuthCard>
    );
};

export default ResetPassword;
