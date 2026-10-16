const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({ msg: "Not authorized, no token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Reject tokens not issued for standard access (e.g. password_reset tokens)
            if (decoded.purpose && decoded.purpose !== "access") {
                return res.status(401).json({ msg: "Invalid token purpose" });
            }

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ msg: "User not found" });
            }

            // Check if password was changed after token was issued
            if (user.passwordChangedAt) {
                const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
                if (decoded.iat < changedTimestamp) {
                    return res.status(401).json({ msg: "Password was recently changed. Please log in again." });
                }
            }

            // Check account email verification status
            if (user.isVerified === false) {
                return res.status(403).json({
                    msg: "Please verify your email address to continue.",
                    requiresVerification: true,
                    email: user.email,
                });
            }

            req.user = user;
            return next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ msg: "Session expired, please log in again" });
            }
            return res.status(401).json({ msg: "Not authorized, invalid token" });
        }
    }

    return res.status(401).json({ msg: "No token provided" });
};

module.exports = protect;
