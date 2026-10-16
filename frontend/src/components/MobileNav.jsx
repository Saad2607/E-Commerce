import { FaHome, FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const items = [
        { icon: FaHome, label: "Home", path: "/" },
        { icon: FaHeart, label: "Wishlist", path: "/wishlist", auth: true },
        { icon: FaShoppingCart, label: "Cart", path: "/cart", auth: true },
        { icon: FaUser, label: user ? "Account" : "Login", path: user ? "/profile" : "/login" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 shadow-2xl safe-area-pb transition-colors duration-300">
            <div className="flex justify-around py-2 max-w-lg mx-auto">
                {items.map(({ icon: Icon, label, path, auth }) => {
                    const active = location.pathname === path;
                    const disabled = auth && !user;

                    return (
                        <button
                            key={path}
                            onClick={() => !disabled && navigate(path)}
                            disabled={disabled}
                            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
                                active
                                    ? "text-amber-600 dark:text-amber-400 font-bold"
                                    : disabled
                                      ? "text-gray-400 dark:text-gray-600"
                                      : "text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-300"
                            }`}
                        >
                            <Icon size={19} className={active ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : ""} />
                            <span className="text-[11px] font-medium tracking-tight">{label}</span>
                            {active && (
                                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
