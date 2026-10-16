import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import { updateUser } from "../features/authSlice";
import PageLayout from "../components/PageLayout";
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaCheckCircle,
    FaShieldAlt,
    FaKey,
    FaEye,
    FaEyeSlash,
    FaArrowLeft,
    FaFingerprint,
    FaExclamationTriangle,
    FaPalette,
} from "react-icons/fa";

const AVATAR_THEMES = [
    { id: "amber", name: "Amber Gold", gradient: "from-amber-500 via-yellow-400 to-amber-600", border: "border-amber-400" },
    { id: "sapphire", name: "Sapphire Blue", gradient: "from-blue-500 via-cyan-400 to-indigo-600", border: "border-cyan-400" },
    { id: "emerald", name: "Emerald Mint", gradient: "from-emerald-500 via-teal-400 to-green-600", border: "border-emerald-400" },
    { id: "ruby", name: "Ruby Flare", gradient: "from-rose-500 via-pink-400 to-red-600", border: "border-rose-400" },
    { id: "amethyst", name: "Royal Amethyst", gradient: "from-purple-500 via-violet-400 to-indigo-600", border: "border-purple-400" },
];

const EditProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Active navigation tab: "profile" | "email" | "password" | "security"
    const [activeTab, setActiveTab] = useState("profile");

    // Avatar theme selection
    const [avatarTheme, setAvatarTheme] = useState(() => {
        return localStorage.getItem("qk_avatar_theme") || "amber";
    });

    const activeAvatarTheme = useMemo(() => {
        return AVATAR_THEMES.find((t) => t.id === avatarTheme) || AVATAR_THEMES[0];
    }, [avatarTheme]);

    const handleSelectAvatarTheme = (themeId) => {
        setAvatarTheme(themeId);
        localStorage.setItem("qk_avatar_theme", themeId);
        showSuccess("Avatar style updated ✨");
    };

    // 1. Profile Name State
    const [name, setName] = useState("");
    const [savingName, setSavingName] = useState(false);

    // 2. Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Password strength computation
    const passwordStrength = useMemo(() => {
        const pass = passwordForm.newPassword;
        if (!pass) return { score: 0, label: "None", color: "bg-gray-300 dark:bg-gray-700" };
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score === 1) return { score: 1, label: "Weak", color: "bg-red-500" };
        if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
        if (score === 3) return { score: 3, label: "Good", color: "bg-amber-400" };
        return { score: 4, label: "Strong & Secure", color: "bg-emerald-500" };
    }, [passwordForm.newPassword]);

    const passwordsMatch = useMemo(() => {
        if (!passwordForm.confirmPassword) return null;
        return passwordForm.newPassword === passwordForm.confirmPassword;
    }, [passwordForm.newPassword, passwordForm.confirmPassword]);

    // 3. Email Change State
    const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [showEmailPassword, setShowEmailPassword] = useState(false);
    const [emailOtp, setEmailOtp] = useState("");
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailCooldown, setEmailCooldown] = useState(0);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
        }
    }, [user]);

    // Email resend cooldown timer
    useEffect(() => {
        if (emailCooldown <= 0) return;
        const timer = setInterval(() => {
            setEmailCooldown((c) => (c > 0 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [emailCooldown]);

    // Save Name
    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            return showError("Name cannot be empty ❌");
        }

        setSavingName(true);
        try {
            const { data } = await API.put("/auth/profile", { name: name.trim() });
            dispatch(updateUser(data));
            showSuccess("Profile name updated successfully ✅");
        } catch (error) {
            showError(error.response?.data?.msg || "Error updating name ❌");
        } finally {
            setSavingName(false);
        }
    };

    // Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return showError("Please fill all password fields ❌");
        }

        if (newPassword.length < 6) {
            return showError("New password must be at least 6 characters ❌");
        }

        if (newPassword !== confirmPassword) {
            return showError("New passwords do not match ❌");
        }

        setChangingPassword(true);
        try {
            const { data } = await API.put("/auth/change-password", {
                currentPassword,
                newPassword,
            });

            if (data.token) {
                dispatch(updateUser({ ...user, token: data.token }));
            }

            showSuccess("Password changed successfully ✅");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            showError(error.response?.data?.msg || "Failed to change password ❌");
        } finally {
            setChangingPassword(false);
        }
    };

    // Request Email Change
    const handleRequestEmailChange = async (e) => {
        e.preventDefault();

        if (!newEmail || !emailPassword) {
            return showError("Please provide new email and your current password ❌");
        }

        setEmailLoading(true);
        try {
            const { data } = await API.post("/auth/change-email/request", {
                newEmail: newEmail.trim(),
                currentPassword: emailPassword,
            });
            showSuccess(data.msg || "Verification code sent to new email! 📩");
            setEmailOtpSent(true);
            setEmailCooldown(data.cooldownSeconds || 60);
        } catch (error) {
            showError(error.response?.data?.msg || "Failed to request email change ❌");
        } finally {
            setEmailLoading(false);
        }
    };

    // Verify Email Change
    const handleVerifyEmailChange = async (e) => {
        e.preventDefault();

        if (!emailOtp || emailOtp.length !== 6) {
            return showError("Please enter the 6-digit verification code ❌");
        }

        setEmailLoading(true);
        try {
            const { data } = await API.post("/auth/change-email/verify", {
                newEmail: newEmail.trim(),
                otp: emailOtp.trim(),
            });

            dispatch(updateUser(data.user));
            showSuccess("Email updated successfully! 🎉");
            setShowEmailChangeModal(false);
            setNewEmail("");
            setEmailPassword("");
            setEmailOtp("");
            setEmailOtpSent(false);
        } catch (error) {
            showError(error.response?.data?.msg || "Verification failed ❌");
        } finally {
            setEmailLoading(false);
        }
    };

    const navTabs = [
        { id: "profile", label: "Public Profile", icon: FaUser, badge: null },
        { id: "email", label: "Verified Email", icon: FaEnvelope, badge: "Protected" },
        { id: "password", label: "Password & Credentials", icon: FaKey, badge: null },
        { id: "security", label: "Security & Protection", icon: FaShieldAlt, badge: "Active" },
    ];

    return (
        <PageLayout title="Account Settings & Security" subtitle="Manage your personal profile, credentials, and cryptographic security" maxWidth="max-w-7xl">
            {/* Back Navigation Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                    onClick={() => navigate("/profile")}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 transition-colors group"
                >
                    <FaArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Account Overview
                </button>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                        QuickKart Security Engine: Operational
                    </span>
                </div>
            </div>

            {/* Mobile / Tablet Horizontal Navigation Tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
                {navTabs.map(({ id, label, icon: Icon, badge }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 border ${
                            activeTab === id
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 border-amber-400 shadow-md shadow-amber-500/20"
                                : "bg-white dark:bg-[#111827]/90 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                        }`}
                    >
                        <Icon size={13} />
                        <span>{label}</span>
                        {badge && (
                            <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                                    activeTab === id ? "bg-gray-950 text-amber-300" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                            >
                                {badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 12-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column (4 cols on lg, full width on mobile) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Executive Identity Card */}
                    <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                        <div className="flex flex-col items-center text-center">
                            {/* Avatar with dynamic theme ring */}
                            <div className="relative mb-4 group">
                                <div
                                    className={`w-22 h-22 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${activeAvatarTheme.gradient} flex items-center justify-center text-gray-950 text-3xl font-black shadow-gold-sm ring-4 ring-amber-500/20 transition-transform duration-300 group-hover:scale-105`}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || "Q"}
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-[#0b0f17]">
                                    ✓
                                </span>
                            </div>

                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight truncate max-w-full">
                                {user?.name || "QuickKart User"}
                            </h2>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1 truncate max-w-full">
                                {user?.email}
                            </p>

                            {/* Verification & Role Pills */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                    <FaCheckCircle size={10} /> Verified Account
                                </span>
                                {user?.isAdmin && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                                        Administrator
                                    </span>
                                )}
                            </div>

                            {/* Avatar Theme Picker */}
                            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800 w-full">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <FaPalette size={11} className="text-amber-500" /> Avatar Accent
                                    </span>
                                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                                        {activeAvatarTheme.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2.5">
                                    {AVATAR_THEMES.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => handleSelectAvatarTheme(theme.id)}
                                            aria-label={`Select ${theme.name} theme`}
                                            className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${theme.gradient} transition-transform duration-200 hover:scale-110 ${
                                                avatarTheme === theme.id
                                                    ? "ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-[#111827] scale-110 shadow-sm"
                                                    : "opacity-70 hover:opacity-100"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Account Stats Strip */}
                        <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-800 text-center">
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Security Score</p>
                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">100%</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">2FA Protection</p>
                                <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">Enabled</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Vertical Navigation Menu */}
                    <div className="hidden lg:block qk-card p-3 border-gray-200 dark:border-gray-800/90 shadow-xl space-y-1">
                        {navTabs.map(({ id, label, icon: Icon, badge }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 ${
                                    activeTab === id
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-md shadow-amber-500/20"
                                        : "text-gray-700 hover:text-amber-600 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-amber-300 dark:hover:bg-[#0b0f17]/90"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={15} />
                                    <span>{label}</span>
                                </div>
                                {badge && (
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                            activeTab === id
                                                ? "bg-gray-950 text-amber-300"
                                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                        }`}
                                    >
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Quick Security Tip Card */}
                    <div className="qk-card p-5 border-gray-200 dark:border-gray-800/90 shadow-lg">
                        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-2">
                            <FaFingerprint size={16} />
                            <h4 className="text-xs uppercase font-extrabold tracking-wider">Account Protection</h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            Your account is secured with HMAC single-use tokens and cryptographically random 6-digit email OTPs.
                        </p>
                    </div>
                </div>

                {/* Right Column (8 cols on lg, full width on mobile) */}
                <div className="lg:col-span-8">
                    {/* TAB 1: PUBLIC PROFILE */}
                    {activeTab === "profile" && (
                        <div className="qk-card p-6 sm:p-8 border-gray-200 dark:border-gray-800/90 shadow-xl animate-fade-in">
                            <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                    <FaUser size={18} />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">Public Profile Details</h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Manage how your name and identity appear on orders and reviews</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateName} className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                                            Display Name
                                        </label>
                                        <span className="text-[11px] font-mono text-gray-400">
                                            {name.length} / 50 characters
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value.slice(0, 50))}
                                            className="qk-input pl-10"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                                        This name is displayed on order receipts, delivery invoices, and your public customer reviews.
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Active Authentication Email</p>
                                            <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-0.5">{user?.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab("email")}
                                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            Manage Email →
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={savingName || !name.trim() || name === user?.name}
                                        className="qk-btn-primary px-8 py-3 text-xs uppercase tracking-wider font-extrabold disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {savingName ? "Saving..." : "Save Profile Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: VERIFIED EMAIL & SECURITY */}
                    {activeTab === "email" && (
                        <div className="qk-card p-6 sm:p-8 border-gray-200 dark:border-gray-800/90 shadow-xl animate-fade-in">
                            <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                        <FaEnvelope size={18} />
                                    </div>
                                    <div>
                                        <h2 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">Verified Primary Email</h2>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Primary delivery address for order confirmations and security codes</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                    <FaCheckCircle size={12} /> Verified
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active Login & Order Email</span>
                                        <p className="text-base font-bold text-gray-900 dark:text-white font-mono mt-1">{user?.email}</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                                            ✓ Ready for password recovery and one-time password sign in
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEmailChangeModal(true);
                                            setEmailOtpSent(false);
                                        }}
                                        className="qk-btn-primary px-5 py-2.5 text-xs uppercase tracking-wider font-extrabold shrink-0"
                                    >
                                        Change Email Address
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                        <FaShieldAlt className="text-amber-500" size={13} /> Why is Email Verification Required?
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                        To protect your order history and account security, changing your email requires your current password and entering a 6-digit verification OTP sent directly to the new mailbox.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PASSWORD & CREDENTIALS */}
                    {activeTab === "password" && (
                        <div className="qk-card p-6 sm:p-8 border-gray-200 dark:border-gray-800/90 shadow-xl animate-fade-in">
                            <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                    <FaLock size={18} />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">Security Credentials</h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Update account password with real-time strength validation</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="qk-input pr-11"
                                            placeholder="Enter your current account password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                        >
                                            {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password + Strength Meter */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                                            New Password
                                        </label>
                                        {passwordForm.newPassword && (
                                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                Strength: <strong className="text-amber-600 dark:text-amber-400">{passwordStrength.label}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="qk-input pr-11"
                                            placeholder="Min 6 characters (mix letters, numbers, symbols)"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                        >
                                            {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>

                                    {/* 4-Bar Strength Meter */}
                                    {passwordForm.newPassword && (
                                        <div className="mt-2.5 space-y-1.5">
                                            <div className="grid grid-cols-4 gap-1.5 h-1.5">
                                                {[1, 2, 3, 4].map((bar) => (
                                                    <div
                                                        key={bar}
                                                        className={`rounded-full transition-all duration-300 ${
                                                            bar <= passwordStrength.score ? passwordStrength.color : "bg-gray-200 dark:bg-gray-800"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                <span className={passwordForm.newPassword.length >= 6 ? "text-emerald-500 font-bold" : ""}>
                                                    ✓ At least 6 characters
                                                </span>
                                                <span className={/[0-9]/.test(passwordForm.newPassword) ? "text-emerald-500 font-bold" : ""}>
                                                    ✓ Contains number
                                                </span>
                                                <span className={/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? "text-emerald-500 font-bold" : ""}>
                                                    ✓ Contains special symbol
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300">
                                            Confirm New Password
                                        </label>
                                        {passwordsMatch !== null && (
                                            <span
                                                className={`text-[11px] font-bold ${
                                                    passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                                                }`}
                                            >
                                                {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="qk-input pr-11"
                                            placeholder="Re-enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            changingPassword ||
                                            !passwordForm.currentPassword ||
                                            !passwordForm.newPassword ||
                                            passwordForm.newPassword.length < 6 ||
                                            passwordForm.newPassword !== passwordForm.confirmPassword
                                        }
                                        className="qk-btn-primary px-8 py-3 text-xs uppercase tracking-wider font-extrabold disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {changingPassword ? "Updating Password..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 4: SECURITY & PROTECTION AUDIT */}
                    {activeTab === "security" && (
                        <div className="qk-card p-6 sm:p-8 border-gray-200 dark:border-gray-800/90 shadow-xl animate-fade-in space-y-6">
                            <div className="flex items-center gap-3.5 pb-5 border-b border-gray-200 dark:border-gray-800">
                                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                    <FaShieldAlt size={18} />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">Active Protection Matrix</h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Cryptographic protections shielding your account and orders</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">Email OTP Challenge</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Cryptographically secure 6-digit codes sent via Resend API to verify registration and identity changes.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">Bcrypt Salt & Hashing</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Passwords are never stored in plaintext and cannot be decrypted even from raw database backups.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">HMAC Replay Protection</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Verification tokens are single-use only. Used tokens are immediately invalidated across all endpoints.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">JSON Web Token Session</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Encrypted Bearer tokens authenticate API calls with automated revocation upon password changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Email Change Modal */}
            {showEmailChangeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="qk-card w-full max-w-md p-6 sm:p-7 animate-scale-in shadow-2xl border-gray-200 dark:border-amber-500/30">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
                            <div className="flex items-center gap-2.5">
                                <FaShieldAlt className="text-amber-500" size={18} />
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Verify New Email</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEmailChangeModal(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                ×
                            </button>
                        </div>

                        {!emailOtpSent ? (
                            <form onSubmit={handleRequestEmailChange} className="space-y-4">
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0b0f17]/80 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                    Provide your current password and your requested new email. We will dispatch a 6-digit verification OTP to confirm ownership.
                                </p>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                        New Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="qk-input"
                                        placeholder="new-email@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                        Current Account Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showEmailPassword ? "text" : "password"}
                                            value={emailPassword}
                                            onChange={(e) => setEmailPassword(e.target.value)}
                                            className="qk-input pr-11"
                                            placeholder="Enter your current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmailPassword(!showEmailPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                        >
                                            {showEmailPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailChangeModal(false)}
                                        className="qk-btn-secondary text-xs px-4 py-2.5 uppercase tracking-wider font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={emailLoading || !newEmail || !emailPassword}
                                        className="qk-btn-primary text-xs px-5 py-2.5 uppercase tracking-wider font-extrabold disabled:opacity-50"
                                    >
                                        {emailLoading ? "Sending Code..." : "Send Verification OTP"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0b0f17]/80 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                    A 6-digit verification code was emailed to <strong className="text-amber-600 dark:text-amber-400 font-mono">{newEmail}</strong>.
                                </p>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                        6-Digit Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                                        className="qk-input text-center font-mono tracking-widest text-2xl font-black text-amber-600 dark:text-amber-400"
                                        placeholder="123456"
                                        required
                                    />
                                </div>

                                <div className="text-center">
                                    {emailCooldown > 0 ? (
                                        <p className="text-xs text-gray-500">
                                            Resend code in <strong className="text-amber-500 font-mono">{emailCooldown}s</strong>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleRequestEmailChange}
                                            disabled={emailLoading}
                                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            Didn&apos;t receive code? Resend
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setEmailOtpSent(false)}
                                        className="qk-btn-secondary text-xs px-4 py-2.5 uppercase tracking-wider font-bold"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={emailLoading || emailOtp.length !== 6}
                                        className="qk-btn-primary text-xs px-5 py-2.5 uppercase tracking-wider font-extrabold disabled:opacity-50"
                                    >
                                        {emailLoading ? "Verifying..." : "Confirm & Update Email"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default EditProfile;
