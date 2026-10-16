import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import { loginSuccess } from "../features/authSlice";
import AuthCard from "../components/AuthCard";

const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email || "your email";
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
    return `${name.charAt(0)}${"*".repeat(Math.max(1, name.length - 2))}${name.slice(-1)}@${domain}`;
};

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Retrieve email from navigation state, URL search params, or logged-in unverified user
    const searchParams = new URLSearchParams(location.search);
    const initialEmail =
        location.state?.email ||
        searchParams.get("email") ||
        user?.email ||
        "";

    const [email, setEmail] = useState(initialEmail);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [cooldown, setCooldown] = useState(60);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const inputRefs = useRef([]);

    // Timer countdown for resend cooldown
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Handle single digit change and auto-advance
    const handleDigitChange = (index, value) => {
        // Handle numeric input only
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);

        if (digit && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle backspace, arrows, and delete
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = "";
                setOtpDigits(newDigits);
                inputRefs.current[index - 1].focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === "ArrowRight" && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Support pasting complete 6-digit code
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pastedData) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pastedData[i] || "";
        }
        setOtpDigits(newDigits);

        const focusIndex = Math.min(pastedData.length, 5);
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        const fullOtp = otpDigits.join("");

        if (!email) {
            return showError("Please enter the email to verify ❌");
        }

        if (fullOtp.length !== 6) {
            return showError("Please enter the complete 6-digit code ❌");
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/verify-email", {
                email,
                otp: fullOtp,
            });

            dispatch(loginSuccess(data));
            showSuccess("Email verified successfully! Welcome to QuickKart 🎉");

            if (data.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            const errorMsg =
                err.response?.data?.msg ||
                err.response?.data?.message ||
                "Verification failed. Please check the code and try again. ❌";
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;

        if (!email) {
            return showError("Please specify your email address ❌");
        }

        setResending(true);
        try {
            const { data } = await API.post("/auth/resend-otp", {
                email,
                purpose: "register",
            });
            showSuccess(data.msg || "New verification code sent! 📩");
            setCooldown(data.cooldownSeconds || 60);
            setOtpDigits(["", "", "", "", "", ""]);
            if (inputRefs.current[0]) inputRefs.current[0].focus();
        } catch (err) {
            const cooldownRemaining = err.response?.data?.cooldownRemaining;
            if (cooldownRemaining) {
                setCooldown(cooldownRemaining);
            }
            showError(err.response?.data?.msg || "Failed to resend code ❌");
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthCard
            title="Verify Your Email"
            subtitle={`We sent a 6-digit verification code to ${maskEmail(email)}`}
            footer={
                <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Wrong email or need to restart?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-yellow-600 dark:text-yellow-400 font-semibold hover:underline"
                        >
                            Register with another email
                        </button>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Already verified?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-gray-700 dark:text-gray-300 font-medium hover:underline"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            }
        >
            <form onSubmit={handleVerify} className="space-y-6">
                {!initialEmail && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Account Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                        Enter 6-Digit Code
                    </label>

                    {/* 6 Digit Input Group */}
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                        {otpDigits.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                aria-label={`Digit ${idx + 1}`}
                                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition-all shadow-sm"
                            />
                        ))}
                    </div>
                </div>

                {/* Resend Cooldown Section */}
                <div className="text-center">
                    {cooldown > 0 ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Resend code in <span className="font-semibold text-yellow-600 dark:text-yellow-400">{cooldown}s</span>
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:underline disabled:opacity-50"
                        >
                            {resending ? "Sending code..." : "Didn't receive the code? Resend"}
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length !== 6}
                    className="qk-btn-primary w-full py-3 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {loading ? "Verifying..." : "Verify & Continue"}
                </button>
            </form>
        </AuthCard>
    );
};

export default VerifyEmail;
