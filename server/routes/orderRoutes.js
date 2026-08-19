const express = require("express");

const {
  createCustomerOrder,
  getOwnerOrders,
  updateOrderStatus,
  getTodayStats,
  getKitchenOrders,
  updateKitchenOrderStatus,
  getWaiterOrders,
  updateWaiterOrderStatus,
  updateWaiterPaymentStatus,
  getCustomerOrders,
    getManagerOrders,
  updateManagerOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// OWNER
router.get("/today-stats", protect, getTodayStats);
router.get("/owner", protect, getOwnerOrders);

// MANAGER
router.get(
  "/manager/orders",
  protect,
  getManagerOrders
);

router.patch(
  "/manager/orders/:id/status",
  protect,
  updateManagerOrderStatus
);

// CUSTOMER
router.get("/customer", protect, getCustomerOrders);
router.post("/", protect, createCustomerOrder);

// KITCHEN
router.get("/kitchen", protect, getKitchenOrders);
router.patch(
  "/kitchen/:id/status",
  protect,
  updateKitchenOrderStatus
);

// WAITER
router.get("/waiter", protect, getWaiterOrders);
router.patch(
  "/waiter/:id/status",
  protect,
  updateWaiterOrderStatus
);

router.patch(
  "/waiter/:id/payment",
  protect,
  updateWaiterPaymentStatus
);

// OWNER generic status
router.patch(
  "/:id/status",
  protect,
  updateOrderStatus
);

module.exports = router;