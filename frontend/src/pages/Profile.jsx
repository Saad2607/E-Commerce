import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("user"));
        setUser(data);
    }, []);

    if (!user) return <h2 className="p-6">No User Found</h2>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Your Account</h1>

            <div className="grid grid-cols-2 gap-6">

                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                    <h2 className="font-bold mb-3">Profile Info</h2>
                    <p><strong>Name:</strong>{user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <button
                        onClick={() => navigate("/edit-profile")}
                        className="mt-4 bg-yellow-500 px-4 py-2 rounded"
                    >
                        Edit Profile
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                    <h2 className="font-bold mb-3">Orders</h2>
                    <p>View your orders</p>

                    <button
                        onClick={() => navigate("/my-orders")}
                        className="mt-4 bg-blue-500 px-4 py-2 rounded text-black"
                    >
                        My Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;