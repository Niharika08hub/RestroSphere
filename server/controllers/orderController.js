const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
let notifyRestaurantManagers = async () => {};
try {
  ({ notifyRestaurantManagers } = require("../utils/notificationHelper"));
} catch (error) {
  console.warn("notificationHelper not available; order notifications will be skipped.");
}

const STAFF_ROLES = {
  kitchen: ["kitchen", "kitchenStaff"],
  waiter: ["waiter", "waiterStaff"],
};

const getRestaurantId = (req) =>
  req.user?.restaurantId || null;

const orderNumber = (order) =>
  order.orderNumber || order._id.toString().slice(-6).toUpperCase();

async function createOrderNotification(restaurantId, status, order) {
  const messages = {
    pending: ["New Order Received", `Order #${orderNumber(order)} has been placed and is waiting for processing.`],
    preparing: ["Order Preparing", `Order #${orderNumber(order)} is now being prepared.`],
    ready: ["Order Ready", `Order #${orderNumber(order)} is ready to be served.`],
    completed: ["Order Completed", `Order #${orderNumber(order)} has been completed successfully.`],
    cancelled: ["Order Cancelled", `Order #${orderNumber(order)} has been cancelled.`],
  };

  const entry = messages[status];
  if (!entry || !restaurantId) return;

  try {
    await notifyRestaurantManagers({
      restaurantId,
      type: "order",
      title: entry[0],
      message: entry[1],
      referenceId: order._id,
    });
  } catch (error) {
    console.error("ORDER NOTIFICATION ERROR:", error);
  }
}

// =====================================
// OWNER
// =====================================

exports.getOwnerOrders = async (req, res) => {
  try {
    if (req.user?.role !== "owner")
      return res.status(403).json({ success:false, message:"Owner access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const orders = await Order.find({ restaurantId }).sort({ createdAt:-1 });
    return res.json({ success:true, data:orders });
  } catch (error) {
    console.error("OWNER ORDERS ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "owner")
      return res.status(403).json({ success:false, message:"Owner access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const order = await Order.findOne({ _id:req.params.id, restaurantId });
    if (!order)
      return res.status(404).json({ success:false, message:"Order not found" });

    const allowed = ["pending","preparing","ready","completed","cancelled"];
    const newStatus = req.body.status;

    if (!allowed.includes(newStatus))
      return res.status(400).json({ success:false, message:"Invalid order status" });

    if (order.status === newStatus)
      return res.json({ success:true, data:order });

    order.status = newStatus;
    await order.save();
    await createOrderNotification(restaurantId, newStatus, order);

    return res.json({ success:true, data:order });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to update order" });
  }
};

exports.getTodayStats = async (req, res) => {
  try {
    if (req.user?.role !== "owner")
      return res.status(403).json({ success:false, message:"Owner access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const orders = await Order.find({
      restaurantId,
      createdAt:{ $gte:start, $lte:end },
      status:{ $ne:"cancelled" },
    });

    const revenue = orders.reduce((sum,o) => sum + Number(o.totalAmount || 0), 0);
    const customers = new Set(
      orders.filter(o => o.customerId).map(o => o.customerId.toString())
    );

    return res.json({
      success:true,
      data:{ revenue, orders:orders.length, customers:customers.size },
    });
  } catch (error) {
    console.error("TODAY STATS ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to fetch today's statistics" });
  }
};

// =====================================
// KITCHEN
// =====================================

exports.getKitchenOrders = async (req, res) => {
  try {
    if (!STAFF_ROLES.kitchen.includes(req.user?.role))
      return res.status(403).json({ success:false, message:"Kitchen access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const orders = await Order.find({ restaurantId }).sort({ createdAt:-1 });
    return res.json({ success:true, data:orders });
  } catch (error) {
    console.error("KITCHEN ORDERS ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to fetch kitchen orders" });
  }
};

exports.updateKitchenOrderStatus = async (req, res) => {
  try {
    if (!STAFF_ROLES.kitchen.includes(req.user?.role))
      return res.status(403).json({ success:false, message:"Kitchen access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const order = await Order.findOne({ _id:req.params.id, restaurantId });
    if (!order)
      return res.status(404).json({ success:false, message:"Order not found" });

    const transitions = {
      pending:["preparing","cancelled"],
      preparing:["ready","cancelled"],
      ready:["completed","cancelled"],
      completed:[],
      cancelled:[],
    };

    const newStatus = req.body.status;
    if (!Object.keys(transitions).includes(newStatus))
      return res.status(400).json({ success:false, message:"Invalid order status" });

    if (order.status === newStatus)
      return res.json({ success:true, data:order });

    if (!transitions[order.status]?.includes(newStatus))
      return res.status(400).json({
        success:false,
        message:`Cannot change order from ${order.status} to ${newStatus}`,
      });

    order.status = newStatus;
    await order.save();
    await createOrderNotification(restaurantId, newStatus, order);

    return res.json({
      success:true,
      message:"Order status updated successfully",
      data:order,
    });
  } catch (error) {
    console.error("UPDATE KITCHEN ORDER ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to update kitchen order" });
  }
};

// =====================================
// WAITER
// =====================================

exports.getWaiterOrders = async (req, res) => {
  try {
    if (!STAFF_ROLES.waiter.includes(req.user?.role))
      return res.status(403).json({ success:false, message:"Waiter access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const orders = await Order.find({ restaurantId }).sort({ createdAt:-1 });
    return res.json({ success:true, data:orders });
  } catch (error) {
    console.error("WAITER ORDERS ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to fetch waiter orders" });
  }
};

exports.updateWaiterOrderStatus = async (req, res) => {
  try {
    if (!STAFF_ROLES.waiter.includes(req.user?.role))
      return res.status(403).json({ success:false, message:"Waiter access required" });

    const restaurantId = getRestaurantId(req);
    if (!restaurantId)
      return res.status(400).json({ success:false, message:"Restaurant is not linked to this account" });

    const order = await Order.findOne({ _id:req.params.id, restaurantId });
    if (!order)
      return res.status(404).json({ success:false, message:"Order not found" });

    const newStatus = req.body.status;

    if (!["completed","cancelled"].includes(newStatus))
      return res.status(400).json({
        success:false,
        message:"Waiter can only serve or cancel an order",
      });

    if (newStatus === "completed" && order.status !== "ready")
      return res.status(400).json({
        success:false,
        message:"Only ready orders can be served",
      });

    if (
      newStatus === "cancelled" &&
      !["pending","preparing","ready"].includes(order.status)
    )
      return res.status(400).json({
        success:false,
        message:"This order cannot be cancelled",
      });

    order.status = newStatus;
    await order.save();
    await createOrderNotification(restaurantId, newStatus, order);

    return res.json({
      success:true,
      message:newStatus === "completed" ? "Order served successfully" : "Order cancelled successfully",
      data:order,
    });
  } catch (error) {
    console.error("WAITER STATUS ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to update waiter order" });
  }
};

exports.updateWaiterPaymentStatus = async (req, res) => {
  try {
    if (!STAFF_ROLES.waiter.includes(req.user?.role))
      return res.status(403).json({ success:false, message:"Waiter access required" });

    const restaurantId = getRestaurantId(req);
    const order = await Order.findOne({ _id:req.params.id, restaurantId });

    if (!order)
      return res.status(404).json({ success:false, message:"Order not found" });

    if (order.status !== "completed")
      return res.status(400).json({
        success:false,
        message:"Payment can be collected after the order is served",
      });

    const paymentStatus = req.body.paymentStatus;
    if (!["paid","failed"].includes(paymentStatus))
      return res.status(400).json({ success:false, message:"Invalid payment status" });

    order.paymentStatus = paymentStatus;
    await order.save();

    return res.json({
      success:true,
      message:"Payment status updated successfully",
      data:order,
    });
  } catch (error) {
    console.error("WAITER PAYMENT ERROR:", error);
    return res.status(500).json({ success:false, message:"Unable to update payment status" });
  }
};

// =====================================
// CUSTOMER
// =====================================

exports.getCustomerOrders = async (req, res) => {
  try {
    if (req.user?.role !== "customer")
      return res.status(403).json({
        success: false,
        message: "Customer access required"
      });

    const restaurantId = getRestaurantId(req);

    const query = {
      customerId: req.user._id
    };

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error("CUSTOMER ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer orders"
    });
  }
};

exports.createCustomerOrder = async (req, res) => {
  try {
    if (req.user?.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Customer access required"
      });
    }

    // Customer account does not need restaurantId.
    // Use linked restaurant first, otherwise RestroSphere active restaurant.
    let restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      const restaurant = await Restaurant.findOne({
        isActive: true
      }).sort({
        createdAt: 1
      });

      restaurantId = restaurant?._id;
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "No active restaurant found"
      });
    }

    const {
      items,
      tableNumber,
      specialInstructions
    } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const cleanItems = items.map((item) => ({
      name: String(item.name || "").trim(),
      price: Number(item.price),
      quantity: Math.max(
        1,
        Number(item.quantity || 1)
      )
    }));

    if (
      cleanItems.some(
        (item) =>
          !item.name ||
          !Number.isFinite(item.price) ||
          item.price < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order items"
      });
    }

    const totalAmount = cleanItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      restaurantId,

      customerId: req.user._id,

      customerName:
        req.user.fullName ||
        req.user.name ||
        "Customer",

      items: cleanItems,

      totalAmount,

      status: "pending",

      paymentStatus: "pending",

      tableNumber: tableNumber
        ? String(tableNumber)
        : undefined,

      specialInstructions:
        specialInstructions || ""
    });

    await createOrderNotification(
      restaurantId,
      "pending",
      order
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (error) {
    console.error(
      "CREATE CUSTOMER ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to place order"
    });
  }
};

// =====================================
// MANAGER
// =====================================

exports.getManagerOrders = async (req, res) => {
  try {
    if (req.user?.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    const restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not linked to this account",
      });
    }
const orders = await Order.find({
  restaurantId,
}).sort({ createdAt: -1 });

console.log(
  "MANAGER RESTAURANT ID:",
  restaurantId
);

console.log(
  "MANAGER ORDERS COUNT:",
  orders.length
);

console.log(
  "MANAGER ORDERS:",
  orders.map((o) => ({
    id: o._id,
    restaurantId: o.restaurantId,
    customerName: o.customerName,
    totalAmount: o.totalAmount,
    status: o.status,
  }))
);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("MANAGER ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch manager orders",
    });
  }
};

exports.updateManagerOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required",
      });
    }

    const restaurantId = getRestaurantId(req);

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not linked to this account",
      });
    }

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

    if (order.status === newStatus) {
      return res.json({
        success: true,
        data: order,
      });
    }

    order.status = newStatus;

    await order.save();

    await createOrderNotification(
      restaurantId,
      newStatus,
      order
    );

    return res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "UPDATE MANAGER ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update manager order",
    });
  }
};