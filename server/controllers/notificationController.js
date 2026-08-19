const Notification = require("../models/Notification");

// =====================================
// CHECK OWNER / MANAGER
// =====================================

const checkStaffAccess = (req, res) => {
  if (
    !req.user ||
    ![
      "owner",
      "manager",
    ].includes(req.user.role)
  ) {
    res.status(403).json({
      success: false,
      message:
        "Notification access required",
    });

    return false;
  }

  if (!req.user.restaurantId) {
    res.status(400).json({
      success: false,
      message:
        "Restaurant is not linked to this account",
    });

    return false;
  }

  return true;
};

// =====================================
// GET ALL NOTIFICATIONS
// OWNER + MANAGER
// =====================================

exports.getNotifications = async (
  req,
  res
) => {
  try {
    if (
      !checkStaffAccess(
        req,
        res
      )
    ) {
      return;
    }

    const notifications =
      await Notification.find({
        restaurantId:
          req.user.restaurantId,

        recipientId:
          req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(100);

    const unreadCount =
      await Notification.countDocuments({
        restaurantId:
          req.user.restaurantId,

        recipientId:
          req.user._id,

        isRead: false,
      });

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch notifications",
    });
  }
};

// =====================================
// CREATE NOTIFICATION
// OWNER ONLY
// =====================================

exports.createNotification =
  async (req, res) => {
    try {
      if (
        !req.user ||
        req.user.role !==
          "owner"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Owner access required",
        });
      }

      if (!req.user.restaurantId) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant is not linked to this account",
        });
      }

      const {
        type,
        title,
        message,
        referenceId,
      } = req.body;

      if (
        !type ||
        !title ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Type, title and message are required",
        });
      }

      const notification =
        await Notification.create({
          restaurantId:
            req.user.restaurantId,

          recipientId:
            req.user._id,

          type,

          title:
            title.trim(),

          message:
            message.trim(),

          referenceId:
            referenceId ||
            null,

          isRead: false,
        });

      return res.status(201).json({
        success: true,
        message:
          "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      console.error(
        "CREATE NOTIFICATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create notification",
      });
    }
  };

// =====================================
// MARK ONE AS READ
// OWNER + MANAGER
// =====================================

exports.markNotificationAsRead =
  async (req, res) => {
    try {
      if (
        !checkStaffAccess(
          req,
          res
        )
      ) {
        return;
      }

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id:
              req.params.id,

            restaurantId:
              req.user.restaurantId,

            recipientId:
              req.user._id,
          },
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update notification",
      });
    }
  };

// =====================================
// MARK ALL AS READ
// OWNER + MANAGER
// =====================================

exports.markAllNotificationsAsRead =
  async (req, res) => {
    try {
      if (
        !checkStaffAccess(
          req,
          res
        )
      ) {
        return;
      }

      await Notification.updateMany(
        {
          restaurantId:
            req.user.restaurantId,

          recipientId:
            req.user._id,

          isRead: false,
        },
        {
          isRead: true,
        }
      );

      return res.json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update notifications",
      });
    }
  };

// =====================================
// DELETE NOTIFICATION
// OWNER + MANAGER
// =====================================

exports.deleteNotification =
  async (req, res) => {
    try {
      if (
        !checkStaffAccess(
          req,
          res
        )
      ) {
        return;
      }

      const notification =
        await Notification.findOneAndDelete(
          {
            _id:
              req.params.id,

            restaurantId:
              req.user.restaurantId,

            recipientId:
              req.user._id,
          }
        );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete notification",
      });
    }
  };