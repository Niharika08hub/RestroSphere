const express = require("express");

const {
  getRestaurantSettings,
  updateRestaurantSettings,
  getPublicRestaurant,
} = require("../controllers/restaurantController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// PUBLIC RESTAURANT
// =====================================

router.get(
  "/public/:slug",
  getPublicRestaurant
);

// =====================================
// OWNER RESTAURANT SETTINGS
// =====================================

// Get restaurant settings
router.get(
  "/settings",
  protect,
  getRestaurantSettings
);

// Update restaurant settings
router.patch(
  "/settings",
  protect,
  updateRestaurantSettings
);

module.exports = router;