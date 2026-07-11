const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/email");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: "User already exists" });

        const user = await User.create({ name, email, password });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ msg: "If that email exists, a reset link has been sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            await sendEmail(
                user.email,
                "Reset Your Password 🔐",
                `
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your password. This link expires in 10 minutes.</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>If you did not request this, you can ignore this email.</p>
                `
            );
        } catch (emailErr) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ msg: "Failed to send reset email. Try again later." });
        }

        res.json({ msg: "If that email exists, a reset link has been sent" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired reset link" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ msg: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        if (req.body.email && req.body.email !== user.email) {
            const emailTaken = await User.findOne({ email: req.body.email });
            if (emailTaken) {
                return res.status(400).json({ msg: "Email already in use" });
            }
            user.email = req.body.email;
        }

        user.name = req.body.name ?? user.name;

        if (req.body.password) {
            if (req.body.password.length < 6) {
                return res.status(400).json({ msg: "Password must be at least 6 characters" });
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
