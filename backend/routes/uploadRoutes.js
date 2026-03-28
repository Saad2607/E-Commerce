const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const {uploadImage} = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");

// single image upload
router.post("/", protect, upload.single("images"), uploadImage);

module.exports = router;