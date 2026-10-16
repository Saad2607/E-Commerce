import { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaKey, FaEnvelope } from "react-icons/fa";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";
import AuthCard from "../components/AuthCard";

const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition";

const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email || "your email";
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
    return `${name.charAt(0)}${"*".repeat(Math.max(1, name.length - 2))}${name.slice(-1)}@${domain}`;
};

const Login = () => {
    const [loginMode, setLoginMode] = useState("password"); // "password" | "otp"
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // OTP Login state
    const [otpEmail, setOtpEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [cooldown, setCooldown] = useState(0);
    const [resending, setResending] = useState(false);
    const otpInputRefs = useRef([]);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("session") === "expired") {
            showError("Session expired. Please login again.");
        }
    }, []);

    // Countdown timer for OTP login resend
    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown((c) => (c > 0 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    const handlePasswordLogin = async (e) => {
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
            if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
                showError("Account not verified. Verification code sent! 📩");
                navigate("/verify-email", {
                    state: { email: form.email, purpose: "register" },
                });
                return;
            }
            showError(err.response?.data?.msg || "Invalid credentials ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtpLogin = async (e) => {
        e.preventDefault();

        if (!otpEmail) {
            return showError("Please enter your email ❌");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/otp-login/request", { email: otpEmail });
            showSuccess(data.msg || "If an account exists, a login code was sent 📩");
            setOtpSent(true);
            setCooldown(60);
            setTimeout(() => {
                if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
            }, 100);
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to send login code ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpLogin = async (e) => {
        e.preventDefault();
        const fullOtp = otpDigits.join("");

        if (fullOtp.length !== 6) {
            return showError("Please enter the complete 6-digit code ❌");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/otp-login/verify", {
                email: otpEmail,
                otp: fullOtp,
            });

            dispatch(loginSuccess(data));
            showSuccess("Login Successful ✅");

            if (data.isAdmin) {
                navigate("/admin");
            } else {
                navigate(location.state?.from || "/");
            }
        } catch (err) {
            showError(err.response?.data?.msg || "Invalid or expired login code ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpDigitChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);

        if (digit && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                otpInputRefs.current[index - 1].focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0 && otpInputRefs.current[index - 1]) {
            otpInputRefs.current[index - 1].focus();
        } else if (e.key === "ArrowRight" && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pastedData[i] || "";
        }
        setOtpDigits(newDigits);

        const focusIndex = Math.min(pastedData.length, 5);
        if (otpInputRefs.current[focusIndex]) {
            otpInputRefs.current[focusIndex].focus();
        }
    };

    const handleResendLoginOtp = async () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        try {
            const { data } = await API.post("/auth/otp-login/request", { email: otpEmail });
            showSuccess(data.msg || "New code sent! 📩");
            setCooldown(60);
            setOtpDigits(["", "", "", "", "", ""]);
            if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to resend code ❌");
        } finally {
            setResending(false);
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
            {/* Login Method Tabs */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl p-1 mb-6 bg-gray-50 dark:bg-gray-800">
                <button
                    type="button"
                    onClick={() => {
                        setLoginMode("password");
                        setOtpSent(false);
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                        loginMode === "password"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                    <FaKey size={13} />
                    Password
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setLoginMode("otp");
                        if (!otpEmail && form.email) setOtpEmail(form.email);
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                        loginMode === "otp"
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                    <FaEnvelope size={13} />
                    Email OTP
                </button>
            </div>

            {/* Mode 1: Standard Password Login */}
            {loginMode === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                        className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg mt-2 disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>
            )}

            {/* Mode 2: Optional Email OTP Login */}
            {loginMode === "otp" && !otpSent && (
                <form onSubmit={handleRequestOtpLogin} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Sign in without a password. We&apos;ll send a 6-digit one-time code to your registered email.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Account Email
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={otpEmail}
                            className={inputClass}
                            onChange={(e) => setOtpEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg mt-2 disabled:opacity-60"
                    >
                        {loading ? "Sending code..." : "Send Login Code"}
                    </button>
                </form>
            )}

            {loginMode === "otp" && otpSent && (
                <form onSubmit={handleVerifyOtpLogin} className="space-y-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        Enter the 6-digit login code sent to <strong>{maskEmail(otpEmail)}</strong>
                    </p>

                    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                        {otpDigits.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (otpInputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                aria-label={`Digit ${idx + 1}`}
                                className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition shadow-sm"
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        {cooldown > 0 ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Resend code in <span className="font-semibold text-yellow-600 dark:text-yellow-400">{cooldown}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendLoginOtp}
                                disabled={resending}
                                className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:underline disabled:opacity-50"
                            >
                                {resending ? "Sending..." : "Didn't receive code? Resend"}
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otpDigits.join("").length !== 6}
                        className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Verify & Sign In"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setOtpSent(false);
                            setOtpDigits(["", "", "", "", "", ""]);
                        }}
                        className="w-full text-center text-xs text-gray-500 hover:underline"
                    >
                        Use a different email
                    </button>
                </form>
            )}
        </AuthCard>
    );
};

export default Login;
