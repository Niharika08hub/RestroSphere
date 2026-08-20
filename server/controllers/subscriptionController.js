const crypto = require("crypto");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

const PLANS = {
  monthly: { amount: 999, months: 1 },
  quarterly: { amount: 2699, months: 3 },
  yearly: { amount: 8999, months: 12 },
};

const getOwnerRestaurant = async (userId) => {
  return Restaurant.findOne({ ownerId: userId });
};

const razorpayHeaders = () => ({
  Authorization:
    "Basic " +
    Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64"),
  "Content-Type": "application/json",
});

exports.getMySubscription = async (req, res) => {
  try {
    if (req.user?.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Owner access required",
      });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      subscription: restaurant.subscription || null,
    });
  } catch (error) {
    console.error("GET SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load subscription",
    });
  }
};

exports.createSubscriptionOrder = async (req, res) => {
  try {
    const isOwner = req.user?.role === "owner";

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are not configured on the server",
      });
    }

    const { plan } = req.body;
    const selected = PLANS[plan];

    if (!selected) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // Keep the existing owner flow exactly as before.
    const restaurant = isOwner
      ? await getOwnerRestaurant(req.user._id)
      : null;

    if (isOwner && !restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const receipt = restaurant
      ? `rs_${restaurant._id.toString().slice(-10)}_${Date.now()}`
      : `rs_public_${Date.now()}`;

    const response = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: razorpayHeaders(),
        body: JSON.stringify({
          amount: selected.amount * 100,
          currency: "INR",
          receipt,
          notes: {
            ...(restaurant
              ? {
                  restaurantId: restaurant._id.toString(),
                  ownerId: req.user._id.toString(),
                }
              : {}),
            plan,
          },
        }),
      }
    );

    const order = await response.json();

    if (!response.ok) {
      console.error("RAZORPAY CREATE ORDER ERROR:", order);
      return res.status(502).json({
        success: false,
        message: order?.error?.description || "Unable to create payment order",
      });
    }

    // For logged-in owners, preserve the existing subscription workflow.
    if (restaurant) {
      if (!restaurant.slug) {
        const baseSlug = String(restaurant.name || "restaurant")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let slug = baseSlug || `restaurant-${restaurant._id}`;
        let counter = 1;

        while (
          await Restaurant.findOne({
            slug,
            _id: { $ne: restaurant._id },
          })
        ) {
          slug = `${baseSlug || "restaurant"}-${counter}`;
          counter++;
        }

        restaurant.slug = slug;
      }

      restaurant.subscription = {
        ...(restaurant.subscription || {}),
        status: "pending",
        plan,
        amount: selected.amount,
        months: selected.months,
        pendingOrderId: order.id,
      };

      await restaurant.save();
    }

    const owner = restaurant && req.user?._id
      ? await User.findById(req.user._id).select("fullName email phone")
      : null;

    return res.json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      owner,
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start subscription payment",
    });
  }
};

exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const isOwner = req.user?.role === "owner";

    const {
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const selected = PLANS[plan];

    if (!selected || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment verification data",
      });
    }

    const restaurant = isOwner
      ? await getOwnerRestaurant(req.user._id)
      : null;

    if (isOwner && !restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Owner payments still use the existing server-side pending-order check.
    if (restaurant && (
      !restaurant.subscription ||
      restaurant.subscription.pendingOrderId !== razorpay_order_id
    )) {
      return res.status(400).json({
        success: false,
        message: "Payment order does not match this restaurant",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Preserve the existing activation behavior for logged-in owners.
    if (restaurant) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selected.months);

      restaurant.subscription = {
        status: "active",
        plan,
        amount: selected.amount,
        months: selected.months,
        startDate,
        endDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        pendingOrderId: "",
      };

      restaurant.isActive = true;
      await restaurant.save();

      return res.json({
        success: true,
        message: "Subscription activated successfully",
        subscription: restaurant.subscription,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      subscription: null,
      restaurant: null,
    });
  } catch (error) {
    console.error("VERIFY SUBSCRIPTION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify subscription",
    });
  }
};
