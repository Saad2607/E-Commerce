import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLayout from "../components/PageLayout";
import { FaUser, FaClipboardList, FaEdit } from "react-icons/fa";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <PageLayout title="Your Account" subtitle="Manage your profile and orders">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="qk-card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 text-xl font-bold">
                            {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            {user.isAdmin && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <FaUser className="text-yellow-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                            <FaUser className="text-yellow-500" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/edit-profile")}
                        className="qk-btn-primary w-full mt-6 py-2.5 flex items-center justify-center gap-2"
                    >
                        <FaEdit size={14} /> Edit Profile
                    </button>
                </div>

                <div className="qk-card p-6 flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <FaClipboardList size={20} />
                    </div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg">My Orders</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 flex-1">
                        Track your orders, view status updates, and download invoices.
                    </p>
                    <button
                        onClick={() => navigate("/my-orders")}
                        className="qk-btn-secondary w-full py-2.5 mt-6"
                    >
                        View Orders
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default Profile;
