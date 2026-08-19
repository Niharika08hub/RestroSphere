const Notification = require("../models/Notification");
const User = require("../models/User");

// =====================================
// CREATE NOTIFICATION FOR OWNER + MANAGERS
// =====================================

const notifyRestaurantManagers = async ({
  restaurantId,
  type,
  title,
  message,
  referenceId = null,
}) => {
  try {
    if (
      !restaurantId ||
      !type ||
      !title ||
      !message
    ) {
      return [];
    }

    // Find owner + all managers
    const recipients =
      await User.find({
        restaurantId,
        role: {
          $in: [
            "owner",
            "manager",
          ],
        },
      }).select("_id");

    if (!recipients.length) {
      return [];
    }

    const notifications =
      recipients.map(
        (user) => ({
          restaurantId,

          recipientId:
            user._id,

          type,

          title:
            title.trim(),

          message:
            message.trim(),

          referenceId:
            referenceId || null,

          isRead: false,
        })
      );

    return await Notification.insertMany(
      notifications
    );
  } catch (error) {
    console.error(
      "RESTAURANT NOTIFICATION ERROR:",
      error
    );

    return [];
  }
};

module.exports = {
  notifyRestaurantManagers,
};