import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FaBox,
    FaChartBar,
    FaClipboardList,
    FaHome,
    FaUserShield,
} from "react-icons/fa";

const AdminLayout = ({ title, subtitle, children }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    const navItems = [
        { to: "/admin", label: "Dashboard", icon: FaChartBar },
        { to: "/admin/orders", label: "Orders", icon: FaClipboardList },
        { to: "/", label: "Storefront", icon: FaHome },
    ];

    return (
        <div className="min-h-[calc(100vh-70px)] bg-gray-50 text-gray-900 dark:bg-[#0b0f17] dark:text-gray-100 hero-pattern py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <aside className="qk-card p-5 h-fit border border-gray-200 dark:border-gray-800/90 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-gray-950 shadow-md">
                            <FaUserShield size={20} />
                        </div>
                        <div>
                            <p className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">Admin Console</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">QuickKart Executive</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-amber-500/20 rounded-xl p-3.5 mb-6">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Administrator</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">
                            {user?.name}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400/80 font-mono truncate">{user?.email}</p>
                    </div>

                    <nav className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2">
                        {navItems.map(({ to, label, icon: Icon }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex-1 flex items-center justify-center lg:justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                                        active
                                            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-md shadow-amber-500/20"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/60"
                                    }`}
                                >
                                    <Icon size={15} />
                                    <span>{label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main>
                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
                        </div>
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 pl-4 font-medium">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
