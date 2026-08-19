const express = require("express");

const {
  getReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// OWNER REPORTS
// Login + owner required
// =====================================

router.get("/", protect, getReport);

module.exports = router;