const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const Inventory = require("../models/Inventory");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/Notification");

// =====================================
// MANAGER DASHBOARD
// =====================================

exports.getManagerDashboard = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not linked to this account",
      });
    }

    // =====================================
    // TODAY DATE RANGE
    // =====================================

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // =====================================
    // ORDERS
    // =====================================

    const [
      pendingOrders,
      preparingOrders,
      readyOrders,
      todayOrders,
    ] = await Promise.all([
      Order.countDocuments({
        restaurantId,
        status: "pending",
      }),

      Order.countDocuments({
        restaurantId,
        status: "preparing",
      }),

      Order.countDocuments({
        restaurantId,
        status: "ready",
      }),

      Order.find({
        restaurantId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // =====================================
    // RESERVATIONS
    // =====================================

    const todayReservations =
      await Reservation.countDocuments({
        restaurantId,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: {
          $nin: ["cancelled", "completed"],
        },
      });

    // =====================================
    // TABLES
    // =====================================

    const [
      totalTables,
      occupiedTables,
    ] = await Promise.all([
      Table.countDocuments({
        restaurantId,
      }),

      Table.countDocuments({
        restaurantId,
        status: "occupied",
      }),
    ]);

    // =====================================
    // INVENTORY
    // =====================================

    const inventoryItems =
      await Inventory.find({
        restaurantId,
      }).select(
        "itemName quantity minimumStock unit"
      );

    const outOfStockItems =
      inventoryItems.filter(
        (item) =>
          Number(item.quantity || 0) === 0
      );

    const lowStockItems =
      inventoryItems.filter(
        (item) =>
          Number(item.quantity || 0) > 0 &&
          Number(item.quantity || 0) <=
            Number(item.minimumStock || 0)
      );

    // =====================================
    // RESPONSE
    // =====================================

    return res.json({
      success: true,

      data: {
        orders: {
          pending: pendingOrders,
          preparing: preparingOrders,
          ready: readyOrders,
          today: todayOrders,
        },

        reservations: {
          today: todayReservations,
        },

        tables: {
          total: totalTables,
          occupied: occupiedTables,
          available: Math.max(
            totalTables - occupiedTables,
            0
          ),
        },

        inventory: {
          lowStock: lowStockItems,
          outOfStock: outOfStockItems,
          lowStockCount:
            lowStockItems.length,
          outOfStockCount:
            outOfStockItems.length,
        },
      },
    });
  } catch (error) {
    console.error(
      "MANAGER DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch manager dashboard",
    });
  }
};

// =====================================
// GET MANAGER ORDERS
// =====================================

exports.getManagerOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    const orders = await Order.find({
      restaurantId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(
      "MANAGER ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch manager orders",
    });
  }
};

// =====================================
// UPDATE MANAGER ORDER STATUS
// =====================================

exports.updateManagerOrderStatus = async (
  req,
  res
) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    const restaurantId = req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    // Find the exact order belonging
    // to this manager's restaurant
    const order = await Order.findOne({
      _id: req.params.id,
      restaurantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allowedStatuses = [
      "pending",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    const newStatus = req.body.status;

    if (!allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const oldStatus = order.status;

    // No unnecessary update
    if (oldStatus === newStatus) {
      return res.json({
        success: true,
        data: order,
      });
    }

    order.status = newStatus;

    await order.save();

    // =====================================
    // MANAGER ORDER NOTIFICATION
    // =====================================

    let title = "";
    let message = "";

    switch (newStatus) {
      case "pending":
        title = "New Order Received";
        message =
          "A new order has been received and is waiting for processing.";
        break;

      case "preparing":
        title = "Order Preparing";
        message =
          "An order is now being prepared.";
        break;

      case "ready":
        title = "Order Ready";
        message =
          "An order is ready to be served.";
        break;

      case "completed":
        title = "Order Completed";
        message =
          "An order has been completed successfully.";
        break;

      case "cancelled":
        title = "Order Cancelled";
        message =
          "An order has been cancelled.";
        break;
    }

    if (title && message) {
      await Notification.create({
        restaurantId,
        recipientId: req.user._id,
        type: "order",
        title,
        message,
        referenceId: order._id,
        isRead: false,
      });
    }

    return res.json({
      success: true,
      message:
        "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "MANAGER UPDATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update order status",
    });
  }
};