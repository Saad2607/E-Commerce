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
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-gray-900">
                            <FaUserShield />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Admin Panel</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">QuickKart</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-6">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                            {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.name}</p>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map(({ to, label, icon: Icon }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                                        active
                                            ? "bg-yellow-500 text-gray-900"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <main>
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
