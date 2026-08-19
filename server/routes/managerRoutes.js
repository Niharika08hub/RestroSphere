const express = require("express");

const {
  getManagerDashboard,
  getManagerOrders,
  updateManagerOrderStatus,
} = require("../controllers/managerController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================
// MANAGER DASHBOARD
// =====================================

router.get(
  "/dashboard",
  protect,
  authorizeRoles("manager"),
  getManagerDashboard
);

// =====================================
// MANAGER ORDERS
// =====================================

router.get(
  "/orders",
  protect,
  authorizeRoles("manager"),
  getManagerOrders
);

// =====================================
// UPDATE ORDER STATUS
// =====================================

router.patch(
  "/orders/:id/status",
  protect,
  authorizeRoles("manager"),
  updateManagerOrderStatus
);

module.exports = router;