const express = require("express");

const {
  getAnalytics,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// OWNER ANALYTICS
// Login + owner required
// =====================================

router.get("/", protect, getAnalytics);

module.exports = router;