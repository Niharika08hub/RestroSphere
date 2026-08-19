const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getCustomers,
} = require("../controllers/customerController");

const router = express.Router();

// Get all customers for logged-in owner's restaurant
router.get("/", protect, getCustomers);

module.exports = router;