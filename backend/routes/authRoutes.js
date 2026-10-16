const express = require("express");
const router = express.Router();
const {
    registerUser,
    verifyEmail,
    resendOtp,
    loginUser,
    requestOtpLogin,
    verifyOtpLogin,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    changePassword,
    requestEmailChange,
    verifyEmailChange,
    updateProfile,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

// Registration & Verification
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);

// Standard Login & Optional OTP Login
router.post("/login", loginUser);
router.post("/otp-login/request", requestOtpLogin);
router.post("/otp-login/verify", verifyOtpLogin);

// Forgot Password & Reset
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.put("/reset-password/:token", resetPassword);
router.put("/reset-password", resetPassword);

// Sensitive Account Changes (Protected)
router.put("/change-password", protect, changePassword);
router.post("/change-email/request", protect, requestEmailChange);
router.post("/change-email/verify", protect, verifyEmailChange);
router.put("/profile", protect, updateProfile);

module.exports = router;