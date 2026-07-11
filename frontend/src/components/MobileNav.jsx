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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
            <div className="flex justify-around py-2">
                {items.map(({ icon: Icon, label, path, auth }) => {
                    const active = location.pathname === path;
                    const disabled = auth && !user;

                    return (
                        <button
                            key={path}
                            onClick={() => !disabled && navigate(path)}
                            disabled={disabled}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition ${
                                active
                                    ? "text-yellow-500"
                                    : disabled
                                      ? "text-gray-300 dark:text-gray-600"
                                      : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
