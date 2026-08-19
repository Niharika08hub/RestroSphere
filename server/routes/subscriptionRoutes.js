const express = require("express");

const {
  getMySubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
} = require("../controllers/subscriptionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMySubscription);
router.post("/create-order", protect, createSubscriptionOrder);
router.post("/verify", protect, verifySubscriptionPayment);

module.exports = router;
