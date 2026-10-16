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
                const { data } = await API.get("/cart", { silent: true });
                setCartCount(data?.length || 0);
            } catch {
                setCartCount(0);
            }
        };
        fetchCartCount();
        const interval = setInterval(fetchCartCount, 60000);
        return () => clearInterval(interval);
    }, [user]);

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
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md text-gray-900 dark:text-white border-b border-gray-200/80 dark:border-gray-800/80 transition-colors duration-300">
            {/* Top Amber Highlight line */}
            <div className="h-[2px] bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="shrink-0 transition-transform hover:scale-105 duration-200">
                        <QuickKartLogo />
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-xl relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400/80" size={14} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search luxury electronics, fashion, essentials..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100/90 dark:bg-[#111827]/90 border border-gray-200 dark:border-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 text-sm transition-all duration-200 shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDark(!dark)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 dark:border-gray-700/60 hover:border-amber-500/40 text-amber-500 dark:text-amber-300 transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {dark ? "☀️" : "🌙"}
                        </button>

                        {/* Wishlist Button */}
                        <button
                            onClick={() => navigate("/wishlist")}
                            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 dark:border-gray-700/60 hover:border-red-500/40 text-red-500 dark:text-red-400 hover:text-red-600 transition-all duration-200"
                            aria-label="Wishlist"
                        >
                            <FaHeart size={16} />
                        </button>

                        {/* Cart Button with Glow Badge */}
                        <button
                            onClick={() => navigate("/cart")}
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 dark:border-gray-700/60 hover:border-amber-500/40 text-amber-600 dark:text-amber-400 transition-all duration-200"
                            aria-label="Cart"
                        >
                            <FaShoppingCart size={16} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 text-[11px] font-black shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* User Menu / Login */}
                        <div className="relative hidden sm:block" ref={menuRef}>
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 dark:border-gray-700/60 hover:border-amber-500/40 transition-all duration-200"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-gray-950 font-black text-xs shadow-sm">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="hidden lg:inline text-sm font-semibold max-w-[100px] truncate text-gray-700 dark:text-gray-200">
                                            {user.name}
                                        </span>
                                    </button>

                                    {open && (
                                        <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-[#111827]/95 backdrop-blur-xl text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-amber-500/30 overflow-hidden animate-scale-in z-50">
                                            <div className="px-4 py-3 bg-amber-500/10 border-b border-gray-100 dark:border-gray-800">
                                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                                <p className="text-xs text-amber-600 dark:text-amber-400/80 truncate font-mono mt-0.5">
                                                    {user.email}
                                                </p>
                                                {user.isAdmin && (
                                                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                                                        Store Admin
                                                    </span>
                                                )}
                                            </div>
                                            <div className="py-1">
                                                {navLinks.map(({ label, path }) => (
                                                    <button
                                                        key={path}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 dark:text-gray-300 dark:hover:text-amber-300 dark:hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                                                        onClick={() => {
                                                            navigate(path);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-100 dark:border-gray-800/80 p-1">
                                                <button
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 transition-colors rounded-xl"
                                                    onClick={() => {
                                                        dispatch(logout());
                                                        navigate("/login");
                                                    }}
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    className="qk-btn-primary px-5 py-2 text-sm"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800/60 dark:border-gray-700/60 text-amber-500 dark:text-amber-400"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-3 relative">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400/80" size={13} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-[#111827]/90 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                    />
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-xl px-4 py-4 animate-slide-up">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-amber-500/20 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-gray-950 font-black text-sm">
                                    {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400/80 truncate font-mono">{user.email}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {navLinks.map(({ label, path }) => (
                                    <button
                                        key={path}
                                        onClick={() => {
                                            navigate(path);
                                            setMobileOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:text-amber-600 hover:bg-amber-50 dark:text-gray-300 dark:hover:text-amber-300 dark:hover:bg-amber-500/10 transition"
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
                                    className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition mt-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                navigate("/login");
                                setMobileOpen(false);
                            }}
                            className="qk-btn-primary w-full py-2.5"
                        >
                            Sign In / Register
                        </button>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
