const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, admin, upload.array("images"), uploadImage);

module.exports = router;
