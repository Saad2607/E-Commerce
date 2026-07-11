import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/authSlice";
import PageLayout from "../components/PageLayout";

const EditProfile = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, email: user.email, password: "" });
        }
    }, [user]);

    const updateProfile = async () => {
        try {
            const payload = { name: form.name, email: form.email };
            if (form.password) payload.password = form.password;

            const { data } = await API.put("/auth/profile", payload);
            dispatch(updateUser({ ...data, isAdmin: data.isAdmin ?? user?.isAdmin }));
            toast.success("Profile updated ✅");
        } catch (error) {
            toast.error(error.response?.data?.msg || "Error updating profile");
        }
    };

    return (
        <PageLayout title="Edit Profile" subtitle="Update your account details">
            <div className="max-w-lg">
                <div className="qk-card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Name
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="qk-input"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Email
                        </label>
                        <input
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="qk-input"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="qk-input"
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    <button onClick={updateProfile} className="qk-btn-primary w-full py-3">
                        Save Changes
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default EditProfile;
