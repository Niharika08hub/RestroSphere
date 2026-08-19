const User = require("../models/User");
const Order = require("../models/Order");

// =========================
// GET ALL CUSTOMERS
// OWNER + MANAGER
// =========================
exports.getCustomers = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not linked to this account",
      });
    }

    const orders = await Order.find({
      restaurantId,
      customerId: { $ne: null },
    }).sort({ createdAt: -1 });

    const customerIds = [
      ...new Set(
        orders
          .filter((order) => order.customerId)
          .map((order) => order.customerId.toString())
      ),
    ];

    const customers = await User.find({
      role: "customer",
      $or: [
        { restaurantId },
        { _id: { $in: customerIds } },
      ],
    })
      .select("fullName email phone createdAt")
      .sort({ createdAt: -1 });

    const customerData = customers.map((customer) => {
      const customerOrders = orders.filter(
        (order) =>
          order.customerId?.toString() ===
          customer._id.toString()
      );

      const totalOrders = customerOrders.length;

      const totalSpent = customerOrders
        .filter((order) => order.status !== "cancelled")
        .reduce(
          (total, order) =>
            total + Number(order.totalAmount || 0),
          0
        );

      const lastOrder =
        customerOrders.length > 0
          ? customerOrders[0].createdAt
          : null;

      return {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone || "",
        createdAt: customer.createdAt,
        totalOrders,
        totalSpent,
        lastOrder,
      };
    });

    return res.json({
      success: true,
      customers: customerData,
    });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customers",
    });
  }
};