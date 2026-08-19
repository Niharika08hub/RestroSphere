const Order = require("../models/Order");

// ===============================
// OWNER ANALYTICS
// ===============================
exports.getAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Owner access required",
      });
    }

    if (!req.user.restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    const { range = "7d" } = req.query;

    const now = new Date();

    let startDate = new Date(now);

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "30d") {
      startDate.setDate(
        startDate.getDate() - 29
      );
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(
        startDate.getDate() - 6
      );
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await Order.find({
      restaurantId: req.user.restaurantId,
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    }).lean();

    // ===============================
    // BASIC STATS
    // ===============================

    const totalOrders = orders.length;

    const completedOrders =
      orders.filter(
        (order) =>
          order.status === "completed"
      );

    const cancelledOrders =
      orders.filter(
        (order) =>
          order.status === "cancelled"
      );

    const revenue =
      completedOrders.reduce(
        (sum, order) =>
          sum +
          Number(order.totalAmount || 0),
        0
      );

    const averageOrderValue =
      completedOrders.length > 0
        ? revenue /
          completedOrders.length
        : 0;

    // ===============================
    // TOP ITEMS
    // ===============================

    const itemMap = {};

    orders.forEach((order) => {
      if (
        order.status === "cancelled"
      ) {
        return;
      }

      (order.items || []).forEach(
        (item) => {
          const name =
            item.name || "Unknown";

          if (!itemMap[name]) {
            itemMap[name] = {
              name,
              quantity: 0,
              revenue: 0,
            };
          }

          itemMap[name].quantity +=
            Number(
              item.quantity || 0
            );

          itemMap[name].revenue +=
            Number(
              item.price || 0
            ) *
            Number(
              item.quantity || 0
            );
        }
      );
    });

    const topItems = Object.values(
      itemMap
    )
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 5);

    // ===============================
    // DAILY ANALYTICS
    // ===============================

    const dailyMap = {};

    const days =
      range === "today"
        ? 1
        : range === "30d"
        ? 30
        : 7;

    for (
      let i = days - 1;
      i >= 0;
      i--
    ) {
      const date = new Date(now);

      date.setDate(
        date.getDate() - i
      );

      date.setHours(0, 0, 0, 0);

      const key =
        date.toISOString().split("T")[0];

      dailyMap[key] = {
        date: key,
        revenue: 0,
        orders: 0,
      };
    }

    orders.forEach((order) => {
      if (
        order.status === "cancelled"
      ) {
        return;
      }

      const orderDate =
        new Date(order.createdAt);

      orderDate.setHours(
        0,
        0,
        0,
        0
      );

      const key =
        orderDate
          .toISOString()
          .split("T")[0];

      if (dailyMap[key]) {
        dailyMap[key].orders += 1;

        if (
          order.status ===
          "completed"
        ) {
          dailyMap[key].revenue +=
            Number(
              order.totalAmount || 0
            );
        }
      }
    });

    const dailyAnalytics =
      Object.values(dailyMap);

    return res.json({
      success: true,

      data: {
        range,

        stats: {
          revenue,
          totalOrders,
          completedOrders:
            completedOrders.length,
          cancelledOrders:
            cancelledOrders.length,
          averageOrderValue,
        },

        topItems,

        dailyAnalytics,
      },
    });
  } catch (error) {
    console.error(
      "GET ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch analytics",
    });
  }
};