import { FaShoppingCart, FaHeart, FaUserCircle, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import QuickKartLogo from "./QuickKartLogo";
import API from "../services/api";

const Navbar = ({ dark, setDark, search, setSearch }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user) {
            setCartCount(0);
            return;
        }
        const fetchCartCount = async () => {
            try {
                const { data } = await API.get("/cart");
                setCartCount(data?.length || 0);
            } catch {
                setCartCount(0);
            }
        };
        fetchCartCount();
        const interval = setInterval(fetchCartCount, 30000);
        return () => clearInterval(interval);
    }, [user, location.pathname]);

    const navLinks = user
        ? [
              { label: "Profile", path: "/profile" },
              { label: "Edit Profile", path: "/edit-profile" },
              ...(!user.isAdmin
                  ? [{ label: "My Orders", path: "/my-orders" }]
                  : [
                        { label: "Admin Dashboard", path: "/admin" },
                        { label: "Manage Orders", path: "/admin/orders" },
                    ]),
          ]
        : [];

    return (
        <header className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
            <div className="h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />

            <div className="px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="shrink-0">
                        <QuickKartLogo />
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setDark(!dark)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 hover:bg-gray-700 transition"
                            aria-label="Toggle theme"
                        >
                            {dark ? "☀️" : "🌙"}
                        </button>

                        <button
                            onClick={() => navigate("/wishlist")}
                            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-gray-800 transition text-red-400"
                            aria-label="Wishlist"
                        >
                            <FaHeart size={18} />
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-800 transition text-yellow-400"
                            aria-label="Cart"
                        >
                            <FaShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-yellow-500 text-gray-900 text-[10px] font-bold">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        <div className="relative hidden sm:block" ref={menuRef}>
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-800 transition"
                                    >
                                        <FaUserCircle size={28} className="text-yellow-400" />
                                        <span className="hidden lg:inline text-sm font-medium max-w-[90px] truncate">
                                            {user.name}
                                        </span>
                                    </button>

                                    {open && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
                                            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-100 dark:border-gray-700">
                                                <p className="font-semibold truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            {navLinks.map(({ label, path }) => (
                                                <button
                                                    key={path}
                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                    onClick={() => {
                                                        navigate(path);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                            <button
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition border-t border-gray-100 dark:border-gray-700"
                                                onClick={() => {
                                                    dispatch(logout());
                                                    navigate("/login");
                                                }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    className="qk-btn-primary px-4 py-2 text-sm"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                <div className="md:hidden mt-3 relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    />
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 animate-slide-up">
                    {user ? (
                        <>
                            <p className="text-sm text-gray-400 mb-2">Signed in as {user.name}</p>
                            {navLinks.map(({ label, path }) => (
                                <button
                                    key={path}
                                    onClick={() => {
                                        navigate(path);
                                        setMobileOpen(false);
                                    }}
                                    className="block w-full text-left py-2.5 text-sm hover:text-yellow-400 transition"
                                >
                                    {label}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    dispatch(logout());
                                    navigate("/login");
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left py-2.5 text-sm text-red-400"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                navigate("/login");
                                setMobileOpen(false);
                            }}
                            className="qk-btn-primary w-full py-2.5"
                        >
                            Login / Register
                        </button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
