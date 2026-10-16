const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendEmail } = require("../utils/emailService");
const {
    createOtpChallenge,
    verifyAndConsumeOtp,
} = require("../utils/otpService");
const {
    otpEmailTemplate,
    passwordChangedTemplate,
    emailChangedTemplate,
} = require("../utils/emailTemplates");

/**
 * Generate standard JWT access token with explicit purpose claim
 */
const generateToken = (id, purpose = "access", expiresIn = "30d") => {
    return jwt.sign({ id, purpose }, process.env.JWT_SECRET, {
        expiresIn,
    });
};

/**
 * Helper to normalize email addresses consistently
 */
const normalizeEmail = (email) => {
    return String(email || "").trim().toLowerCase();
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and initiate email OTP verification
 * @access  Public
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const normalizedEmail = normalizeEmail(email);
        const trimmedName = String(name).trim();

        if (password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });

        let user;

        if (existingUser) {
            // If already verified, reject duplicate registration
            if (existingUser.isVerified !== false) {
                return res.status(400).json({
                    msg: "An account with this email already exists. Please log in or reset your password.",
                });
            }

            // If existing account is unverified, update name and password on the pending record
            existingUser.name = trimmedName;
            existingUser.password = password; // Hashed by User pre("save")
            user = await existingUser.save();
        } else {
            // Create pending unverified user
            user = await User.create({
                name: trimmedName,
                email: normalizedEmail,
                password,
                isVerified: false,
            });
        }

        // Generate and send 6-digit verification OTP
        let challenge;
        try {
            challenge = await createOtpChallenge({
                identifier: normalizedEmail,
                purpose: "register",
                userId: user._id,
                ip: req.ip,
                userAgent: req.headers["user-agent"],
            });

            await sendEmail(
                normalizedEmail,
                "Verify Your QuickKart Email 🔐",
                otpEmailTemplate({
                    otp: challenge.otp,
                    purpose: "register",
                    expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
                })
            );
        } catch (emailErr) {
            console.error("Registration email delivery error:", emailErr.message);
            const statusCode = emailErr.statusCode || 500;
            return res.status(statusCode).json({
                msg: emailErr.message || "Failed to send verification email. Please try again.",
                email: normalizedEmail,
                canRetry: true,
                cooldownRemaining: emailErr.cooldownRemaining,
            });
        }

        return res.status(201).json({
            msg: "Verification code sent to your email. Please verify your account to continue.",
            email: normalizedEmail,
            requiresVerification: true,
            cooldownSeconds: challenge.cooldownSeconds,
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ msg: error.message || "Server error during registration" });
    }
};

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify 6-digit registration OTP and activate account
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ msg: "Email and verification code are required" });
        }

        const normalizedEmail = normalizeEmail(email);

        const verification = await verifyAndConsumeOtp({
            identifier: normalizedEmail,
            purpose: "register",
            otp,
        });

        if (!verification.success) {
            return res.status(400).json({
                msg: verification.message,
                reason: verification.reason,
                remainingAttempts: verification.remainingAttempts,
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ msg: "User account not found" });
        }

        user.isVerified = true;
        await user.save();

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ msg: error.message || "Server error during verification" });
    }
};

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend a 6-digit OTP for registration, forgot-password, or login
 * @access  Public
 */
exports.resendOtp = async (req, res) => {
    try {
        const { email, purpose = "register" } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const normalizedEmail = normalizeEmail(email);
        const validPurposes = ["register", "forgot-password", "otp-login", "change-email"];

        if (!validPurposes.includes(purpose)) {
            return res.status(400).json({ msg: "Invalid OTP purpose" });
        }

        // For registration resend, verify account is unverified
        if (purpose === "register") {
            const user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(404).json({ msg: "No pending registration found for this email" });
            }
            if (user.isVerified !== false) {
                return res.status(400).json({ msg: "Account is already verified. Please log in." });
            }
        }

        // Create new challenge subject to cooldown and rate limits
        const challenge = await createOtpChallenge({
            identifier: normalizedEmail,
            purpose,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        // Send template according to purpose
        const subjectMap = {
            register: "QuickKart — Email Verification Code",
            "forgot-password": "QuickKart — Password Reset Code",
            "otp-login": "QuickKart — Login Verification Code",
            "change-email": "QuickKart — Verify New Email",
        };

        await sendEmail(
            normalizedEmail,
            subjectMap[purpose] || "QuickKart Verification Code",
            otpEmailTemplate({
                otp: challenge.otp,
                purpose,
                expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
            })
        );

        return res.json({
            msg: "A new verification code has been sent to your email.",
            cooldownSeconds: challenge.cooldownSeconds,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            msg: error.message || "Failed to resend verification code",
            cooldownRemaining: error.cooldownRemaining,
        });
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with password & enforce verification
 * @access  Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Reject unverified users and trigger a fresh verification code
        if (user.isVerified === false) {
            try {
                const challenge = await createOtpChallenge({
                    identifier: normalizedEmail,
                    purpose: "register",
                    userId: user._id,
                    ip: req.ip,
                });

                await sendEmail(
                    normalizedEmail,
                    "Verify Your QuickKart Email 🔐",
                    otpEmailTemplate({
                        otp: challenge.otp,
                        purpose: "register",
                        expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
                    })
                );
            } catch (err) {
                console.warn("Unverified user login OTP trigger:", err.message);
            }

            return res.status(403).json({
                msg: "Your account is not verified. A verification code has been sent to your email.",
                requiresVerification: true,
                email: user.email,
            });
        }

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ msg: error.message || "Server error during login" });
    }
};

/**
 * @route   POST /api/auth/otp-login/request
 * @desc    Request a one-time OTP for passwordless login
 * @access  Public
 */
exports.requestOtpLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const normalizedEmail = normalizeEmail(email);

        // Always return generic response to prevent account enumeration
        const genericResponse = {
            msg: "If an eligible verified account exists with this email, a login code has been sent.",
            email: normalizedEmail,
        };

        const user = await User.findOne({ email: normalizedEmail });

        // Only send OTP if user exists and is verified
        if (user && user.isVerified !== false) {
            try {
                const challenge = await createOtpChallenge({
                    identifier: normalizedEmail,
                    purpose: "otp-login",
                    userId: user._id,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                });

                await sendEmail(
                    normalizedEmail,
                    "QuickKart — Your Login Verification Code",
                    otpEmailTemplate({
                        otp: challenge.otp,
                        purpose: "otp-login",
                        expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
                    })
                );
            } catch (emailErr) {
                console.error("OTP login email delivery error:", emailErr.message);
                if (emailErr.statusCode === 429) {
                    return res.status(429).json({ msg: emailErr.message, cooldownRemaining: emailErr.cooldownRemaining });
                }
                return res.status(502).json({
                    msg: `Could not send login code: ${emailErr.message}`,
                });
            }
        }

        return res.json(genericResponse);
    } catch (error) {
        console.error("OTP login request error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   POST /api/auth/otp-login/verify
 * @desc    Verify OTP and log in without password
 * @access  Public
 */
exports.verifyOtpLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ msg: "Email and verification code are required" });
        }

        const normalizedEmail = normalizeEmail(email);

        const verification = await verifyAndConsumeOtp({
            identifier: normalizedEmail,
            purpose: "otp-login",
            otp,
        });

        if (!verification.success) {
            return res.status(400).json({
                msg: verification.message,
                reason: verification.reason,
                remainingAttempts: verification.remainingAttempts,
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user || user.isVerified === false) {
            return res.status(400).json({ msg: "Account not eligible for OTP login" });
        }

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isVerified: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("OTP login verify error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Initiate password reset with 6-digit OTP
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const normalizedEmail = normalizeEmail(email);

        const genericResponse = {
            msg: "If an eligible account exists, a password reset code has been sent to your email.",
            email: normalizedEmail,
        };

        const user = await User.findOne({ email: normalizedEmail });

        if (user && user.isVerified !== false) {
            try {
                const challenge = await createOtpChallenge({
                    identifier: normalizedEmail,
                    purpose: "forgot-password",
                    userId: user._id,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                });

                await sendEmail(
                    normalizedEmail,
                    "QuickKart — Password Reset Code 🔐",
                    otpEmailTemplate({
                        otp: challenge.otp,
                        purpose: "forgot-password",
                        expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
                    })
                );
            } catch (emailErr) {
                console.error("Forgot password email delivery error:", emailErr.message);
                if (emailErr.statusCode === 429) {
                    return res.status(429).json({ msg: emailErr.message, cooldownRemaining: emailErr.cooldownRemaining });
                }
                return res.status(502).json({
                    msg: `Could not send password reset code: ${emailErr.message}`,
                });
            }
        }

        return res.json(genericResponse);
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify password reset OTP and issue purpose-bound reset token
 * @access  Public
 */
exports.verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ msg: "Email and verification code are required" });
        }

        const normalizedEmail = normalizeEmail(email);

        const verification = await verifyAndConsumeOtp({
            identifier: normalizedEmail,
            purpose: "forgot-password",
            otp,
        });

        if (!verification.success) {
            return res.status(400).json({
                msg: verification.message,
                reason: verification.reason,
                remainingAttempts: verification.remainingAttempts,
            });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: "Account not found" });
        }

        // Issue short-lived, purpose-specific reset authorization token (10 minutes)
        // Strictly bound with purpose: "password_reset" so protect middleware rejects it as an access token
        const resetToken = jwt.sign(
            { id: user._id, email: user.email, purpose: "password_reset" },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        return res.json({
            msg: "Verification code confirmed. You may now set a new password.",
            resetToken,
        });
    } catch (error) {
        console.error("Verify reset OTP error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   PUT /api/auth/reset-password/:token?
 * @desc    Set new password with validated reset authorization
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { password, resetToken } = req.body;
        const tokenToVerify = resetToken || req.params.token;

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        if (!tokenToVerify) {
            return res.status(400).json({ msg: "Password reset authorization token is required" });
        }

        let user;

        // Try verifying as purpose-scoped JWT reset authorization
        try {
            const decoded = jwt.verify(tokenToVerify, process.env.JWT_SECRET);
            if (decoded.purpose !== "password_reset") {
                return res.status(400).json({ msg: "Invalid reset authorization purpose" });
            }
            user = await User.findById(decoded.id);
        } catch {
            // Backward-compatible fallback for legacy SHA-256 tokens if url param used
            if (req.params.token && req.params.token.length === 64) {
                const legacyHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
                user = await User.findOne({
                    resetPasswordToken: legacyHash,
                    resetPasswordExpire: { $gt: Date.now() },
                });
            }
        }

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired password reset link/token" });
        }

        user.password = password; // Will be hashed by pre("save")
        user.passwordChangedAt = new Date(); // Revokes active JWT sessions!
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send confirmation email
        try {
            await sendEmail(
                user.email,
                "QuickKart — Your Password Was Reset",
                passwordChangedTemplate({ name: user.name })
            );
        } catch (emailErr) {
            console.error("Password reset confirmation email failed:", emailErr.message);
        }

        return res.json({ msg: "Password reset successful! You can now log in with your new password." });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user with current-password re-authentication
 * @access  Private
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ msg: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        user.password = newPassword;
        user.passwordChangedAt = new Date(); // Invalidates older tokens
        await user.save();

        // Send notification email
        try {
            await sendEmail(
                user.email,
                "QuickKart — Your Password Was Changed",
                passwordChangedTemplate({ name: user.name })
            );
        } catch (emailErr) {
            console.error("Password change notification email error:", emailErr.message);
        }

        // Return a fresh access token so the active user stays authenticated
        return res.json({
            msg: "Password updated successfully",
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   POST /api/auth/change-email/request
 * @desc    Request email change, re-authenticating password and sending OTP to proposed email
 * @access  Private
 */
exports.requestEmailChange = async (req, res) => {
    try {
        const { newEmail, currentPassword } = req.body;

        if (!newEmail || !currentPassword) {
            return res.status(400).json({ msg: "New email and current password are required" });
        }

        const normalizedNewEmail = normalizeEmail(newEmail);

        if (normalizedNewEmail === req.user.email) {
            return res.status(400).json({ msg: "New email must be different from current email" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        // Ensure new email is not already registered by someone else
        const emailExists = await User.findOne({ email: normalizedNewEmail });
        if (emailExists) {
            return res.status(400).json({ msg: "This email address is already in use by another account" });
        }

        const challenge = await createOtpChallenge({
            identifier: user.email,
            purpose: "change-email",
            targetEmail: normalizedNewEmail,
            userId: user._id,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        });

        await sendEmail(
            normalizedNewEmail,
            "QuickKart — Verify Your New Email Address 🔐",
            otpEmailTemplate({
                otp: challenge.otp,
                purpose: "change-email",
                expiryMinutes: parseInt(process.env.OTP_TTL_MINUTES, 10) || 5,
            })
        );

        return res.json({
            msg: `Verification code sent to ${normalizedNewEmail}`,
            newEmail: normalizedNewEmail,
            cooldownSeconds: challenge.cooldownSeconds,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Server error requesting email change" });
    }
};

/**
 * @route   POST /api/auth/change-email/verify
 * @desc    Verify OTP sent to new email and atomically update user email
 * @access  Private
 */
exports.verifyEmailChange = async (req, res) => {
    try {
        const { newEmail, otp } = req.body;

        if (!newEmail || !otp) {
            return res.status(400).json({ msg: "New email and verification code are required" });
        }

        const normalizedNewEmail = normalizeEmail(newEmail);

        const verification = await verifyAndConsumeOtp({
            identifier: req.user.email,
            purpose: "change-email",
            otp,
        });

        if (!verification.success) {
            return res.status(400).json({
                msg: verification.message,
                reason: verification.reason,
                remainingAttempts: verification.remainingAttempts,
            });
        }

        if (verification.challenge.targetEmail !== normalizedNewEmail) {
            return res.status(400).json({ msg: "Email does not match the pending verification challenge" });
        }

        // Final check that email wasn't taken concurrently
        const emailTaken = await User.findOne({
            email: normalizedNewEmail,
            _id: { $ne: req.user._id },
        });

        if (emailTaken) {
            return res.status(400).json({ msg: "Email is already taken by another account" });
        }

        const oldEmail = req.user.email;
        const user = await User.findById(req.user._id);

        user.email = normalizedNewEmail;
        user.isVerified = true;
        const updatedUser = await user.save();

        // Send confirmation to old email address
        try {
            await sendEmail(
                oldEmail,
                "QuickKart — Your Account Email Was Updated",
                emailChangedTemplate({
                    name: updatedUser.name,
                    oldEmail,
                    newEmail: normalizedNewEmail,
                })
            );
        } catch (emailErr) {
            console.error("Email change notification to old email failed:", emailErr.message);
        }

        return res.json({
            msg: "Email address updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                isVerified: true,
                token: generateToken(updatedUser._id),
            },
        });
    } catch (error) {
        console.error("Verify email change error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update basic user profile (name). Sensitive changes redirected to dedicated secure flows.
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Prevent direct email modification without OTP verification
        if (req.body.email && normalizeEmail(req.body.email) !== user.email) {
            return res.status(400).json({
                msg: "Email changes require verification. Please use the Change Email feature.",
            });
        }

        // Prevent direct password modification without current-password re-authentication
        if (req.body.password) {
            return res.status(400).json({
                msg: "Password changes require current password re-authentication. Please use the Change Password feature.",
            });
        }

        user.name = req.body.name ? String(req.body.name).trim() : user.name;
        const updatedUser = await user.save();

        return res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isVerified: updatedUser.isVerified !== false,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ msg: error.message || "Server error" });
    }
};
