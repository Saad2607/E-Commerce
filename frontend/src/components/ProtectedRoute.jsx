import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user.isVerified === false) {
        return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || "")}`} replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (user.isVerified === false) {
        return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || "")}`} replace />;
    }

    if (!user.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
