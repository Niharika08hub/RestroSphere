const express = require("express");

const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// OWNER NOTIFICATIONS
// Login + owner required
// =====================================

// Get notifications
router.get(
  "/",
  protect,
  getNotifications
);

// Create notification
router.post(
  "/",
  protect,
  createNotification
);

// Mark all as read
router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

// Mark one as read
router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// Delete notification
router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;