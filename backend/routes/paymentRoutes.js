const express = require("express");
const router = express.Router();

const {fakePayment} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

router.post("/fake", protect, fakePayment);

module.exports = router;