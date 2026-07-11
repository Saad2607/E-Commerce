import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import AuthCard from "../components/AuthCard";

const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            return showError("Please fill all fields ❌");
        }
        if (form.password.length < 6) {
            return showError("Password must be at least 6 characters ❌");
        }

        setLoading(true);
        try {
            await API.post("/auth/register", form);
            showSuccess("Registered Successfully 🎉");
            navigate("/login");
        } catch (err) {
            showError(err.response?.data?.msg || "Error registering ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Create Account"
            subtitle="Join QuickKart and start shopping"
            footer={
                <>
                    Already have an account?{" "}
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
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name
                    </label>
                    <input
                        placeholder="John Doe"
                        value={form.name}
                        className={inputClass}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>

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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
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
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>
        </AuthCard>
    );
};

export default Register;
