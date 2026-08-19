const Order = require("../models/Order");

// ===============================
// GET RESTAURANT REPORT
// OWNER + MANAGER
// ===============================
exports.getReport = async (req, res) => {
  try {
    // ===============================
    // AUTHORIZATION
    // ===============================

    if (
      !req.user ||
      !["owner", "manager"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access reports",
      });
    }

    // ===============================
    // RESTAURANT
    // ===============================

    const restaurantId =
      req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    // ===============================
    // DATE RANGE
    // ===============================

    const { range = "7d" } =
      req.query;

    const now = new Date();

    let startDate =
      new Date(now);

    if (range === "today") {
      startDate.setHours(
        0,
        0,
        0,
        0
      );
    } else if (range === "30d") {
      startDate.setDate(
        startDate.getDate() - 29
      );

      startDate.setHours(
        0,
        0,
        0,
        0
      );
    } else {
      startDate.setDate(
        startDate.getDate() - 6
      );

      startDate.setHours(
        0,
        0,
        0,
        0
      );
    }

    // ===============================
    // FETCH ORDERS
    // ===============================

    const orders =
      await Order.find({
        restaurantId,

        createdAt: {
          $gte: startDate,
          $lte: now,
        },
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ===============================
    // ORDER STATS
    // ===============================

    const totalOrders =
      orders.length;

    const completedOrders =
      orders.filter(
        (order) =>
          order.status ===
          "completed"
      );

    const cancelledOrders =
      orders.filter(
        (order) =>
          order.status ===
          "cancelled"
      );

    const pendingOrders =
      orders.filter(
        (order) =>
          order.status ===
          "pending"
      );

    const preparingOrders =
      orders.filter(
        (order) =>
          order.status ===
          "preparing"
      );

    const readyOrders =
      orders.filter(
        (order) =>
          order.status ===
          "ready"
      );

    // ===============================
    // REVENUE
    // ===============================

    const revenue =
      completedOrders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount || 0
          ),
        0
      );

    const averageOrderValue =
      completedOrders.length > 0
        ? revenue /
          completedOrders.length
        : 0;

    // ===============================
    // ITEM REPORT
    // ===============================

    const itemMap = {};

    orders.forEach((order) => {
      if (
        order.status ===
        "cancelled"
      ) {
        return;
      }

      (
        order.items || []
      ).forEach((item) => {
        const name =
          item.name ||
          "Unknown";

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
      });
    });

    const itemReport =
      Object.values(
        itemMap
      ).sort(
        (a, b) =>
          b.revenue -
          a.revenue
      );

    // ===============================
    // DAILY REPORT
    // ===============================

    const days =
      range === "today"
        ? 1
        : range === "30d"
        ? 30
        : 7;

    const dailyMap = {};

    for (
      let i = days - 1;
      i >= 0;
      i--
    ) {
      const date =
        new Date(now);

      date.setDate(
        date.getDate() - i
      );

      date.setHours(
        0,
        0,
        0,
        0
      );

      const key =
        date
          .toISOString()
          .split("T")[0];

      dailyMap[key] = {
        date: key,
        orders: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
      };
    }

    orders.forEach(
      (order) => {
        const orderDate =
          new Date(
            order.createdAt
          );

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

        if (!dailyMap[key]) {
          return;
        }

        dailyMap[key].orders +=
          1;

        if (
          order.status ===
          "completed"
        ) {
          dailyMap[key]
            .completed += 1;

          dailyMap[key]
            .revenue +=
            Number(
              order.totalAmount ||
                0
            );
        }

        if (
          order.status ===
          "cancelled"
        ) {
          dailyMap[key]
            .cancelled += 1;
        }
      }
    );

    const dailyReport =
      Object.values(
        dailyMap
      );

    // ===============================
    // RESPONSE
    // ===============================

    return res.json({
      success: true,

      data: {
        range,

        summary: {
          totalOrders,

          completedOrders:
            completedOrders.length,

          cancelledOrders:
            cancelledOrders.length,

          pendingOrders:
            pendingOrders.length,

          preparingOrders:
            preparingOrders.length,

          readyOrders:
            readyOrders.length,

          revenue,

          averageOrderValue,
        },

        itemReport,

        dailyReport,
      },
    });
  } catch (error) {
    console.error(
      "GET REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate report",
    });
  }
};