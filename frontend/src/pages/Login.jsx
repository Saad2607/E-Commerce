import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";
import AuthCard from "../components/AuthCard";

const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("session") === "expired") {
            showError("Session expired. Please login again.");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            return showError("Please fill all fields ❌");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/login", form);
            dispatch(loginSuccess(data));
            showSuccess("Login Successful ✅");

            if (data.isAdmin) {
                navigate("/admin");
            } else {
                navigate(location.state?.from || "/");
            }
        } catch (err) {
            showError(err.response?.data?.msg || "Invalid credentials ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Welcome Back"
            subtitle="Sign in to your QuickKart account"
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
                    >
                        Register
                    </button>
                </>
            }
        >
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        className={inputClass}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={form.password}
                            className={`${inputClass} pr-11`}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                <button
                    type="submit"
                    disabled={loading}
                    className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg mt-2"
                >
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </AuthCard>
    );
};

export default Login;
