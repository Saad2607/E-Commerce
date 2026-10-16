import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLayout from "../components/PageLayout";
import { FaUser, FaClipboardList, FaEdit, FaShieldAlt, FaKey, FaEnvelope } from "react-icons/fa";

const AVATAR_GRADIENTS = {
    amber: "from-amber-500 via-yellow-400 to-amber-600",
    sapphire: "from-blue-500 via-cyan-400 to-indigo-600",
    emerald: "from-emerald-500 via-teal-400 to-green-600",
    ruby: "from-rose-500 via-pink-400 to-red-600",
    amethyst: "from-purple-500 via-violet-400 to-indigo-600",
};

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    if (!user) return null;

    const themeKey = localStorage.getItem("qk_avatar_theme") || "amber";
    const avatarGradient = AVATAR_GRADIENTS[themeKey] || AVATAR_GRADIENTS.amber;

    return (
        <PageLayout title="Account Overview" subtitle="Manage your personal profile, security credentials, and orders" maxWidth="max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Executive Profile Card (7 cols) */}
                <div className="lg:col-span-7 qk-card p-6 sm:p-8 border-gray-200 dark:border-gray-800/90 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-7 pb-6 border-b border-gray-200 dark:border-gray-800 text-center sm:text-left">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-gray-950 text-3xl font-black shadow-gold-sm ring-4 ring-amber-500/20 shrink-0 transition-transform duration-300 hover:scale-105`}>
                            {user.name?.charAt(0)?.toUpperCase() || "Q"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">{user.name}</h2>
                            <p className="text-xs text-amber-600 dark:text-amber-400/90 font-mono truncate mt-0.5">{user.email}</p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                {user.isVerified ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                        ✓ Verified Account
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30">
                                        ⏳ Unverified
                                    </span>
                                )}
                                {user.isAdmin && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                                        Store Admin
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    🛡️ 2FA Protected
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <FaUser size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Customer Name</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <FaEnvelope size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Registered Email Address</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <FaShieldAlt size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Authentication Security</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">Password + 6-Digit Email OTP Challenge</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/edit-profile")}
                        className="qk-btn-primary w-full mt-7 py-3 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-md"
                    >
                        <FaEdit size={14} /> Account Settings & Security
                    </button>
                </div>

                {/* Orders & Quick Actions Card (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Orders Card */}
                    <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-gold-sm">
                            <FaClipboardList size={20} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Order History & Invoices</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
                            Track live shipment delivery status and download official PDF tax invoices anytime.
                        </p>
                        <button
                            onClick={() => navigate("/my-orders")}
                            className="qk-btn-secondary w-full mt-5 py-2.5 text-xs uppercase tracking-wider font-bold"
                        >
                            View Order History
                        </button>
                    </div>

                    {/* Quick Security Badge Card */}
                    <div className="qk-card p-6 border-gray-200 dark:border-gray-800/90 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <FaKey size={14} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Credentials Secure</h4>
                                <p className="text-[11px] text-gray-500">Last updated: Protected</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            Need to update your password or primary contact email? Use the dedicated security tab.
                        </p>
                        <button
                            onClick={() => navigate("/edit-profile")}
                            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                            Update Password & Email →
                        </button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
