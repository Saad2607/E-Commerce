import { FaShoppingCart, FaHeart, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import QuickKartLogo from "./QuickKartLogo";

const Navbar = ({ dark, setDark, search, setSearch }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">

            {/* 🔥 LEFT: LOGO */}
            <Link to="/">
                <QuickKartLogo />
            </Link>

            {/* Search */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-1/3 px-3 py-1 rounded text-black"
            />

            {/* Icons */}
            <div className="flex gap-6 items-center">
                <button
                    onClick={() => setDark(!dark)}
                    className="bg-gray-700 px-3 py-1 rounded"
                >
                    {dark ? "☀️" : "🌙"}
                </button>
                <FaHeart className="cursor-pointer" size={20} color="red" onClick={() => navigate("/wishlist")} />
                <FaShoppingCart className="cursor-pointer text-yellow-300" size={20} onClick={() => navigate("/cart")} />

                <div className="relative" ref={menuRef}>
                    {user ? (
                        <>
                            <FaUserCircle
                                size={26}
                                className="cursor-pointer"
                                onClick={() => setOpen(!open)}
                            />

                            {open && (
                                <div
                                    className={`absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg z-50 transform transition-all duration-200 ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                                        }`}
                                >
                                    <div
                                        className="px-3 py-2"
                                    >
                                        {user.name}
                                    </div>
                                    <hr />
                                    <div
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            navigate("/profile");
                                            setOpen(false);
                                        }}
                                    >
                                        Profile
                                    </div>

                                    <div
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            navigate("/edit-profile");
                                            setOpen(false);
                                        }}
                                    >
                                        Edit Profile
                                    </div>

                                    {!user?.isAdmin && (
                                        <div
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                navigate("/my-orders")
                                                setOpen(false)
                                            }}
                                        >
                                            My Orders
                                        </div>
                                    )}

                                    {user?.isAdmin && (
                                        <div
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                navigate("/admin/orders")
                                                setOpen(false)
                                            }}
                                        >
                                            Manage Orders
                                        </div>
                                    )}

                                    <div
                                        className="px-4 py-2 hover:bg-red-100 cursor-pointer text-red-500"
                                        onClick={() => {
                                            dispatch(logout());
                                            navigate("/login");
                                        }}
                                    >
                                        Logout
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;