const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updateProfile,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/profile", protect, updateProfile);

module.exports = router;