const Restaurant = require("../models/Restaurant");

// ===============================
// OWNER CHECK
// ===============================
const checkOwner = (req, res) => {
  if (!req.user || req.user.role !== "owner") {
    res.status(403).json({
      success: false,
      message: "Owner access required",
    });

    return false;
  }

  return true;
};

// ===============================
// GET RESTAURANT SETTINGS
// ===============================
exports.getRestaurantSettings = async (req, res) => {
  try {
    if (!checkOwner(req, res)) return;

    const restaurant = await Restaurant.findOne({
      ownerId: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "GET RESTAURANT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant settings",
    });
  }
};

// ===============================
// UPDATE RESTAURANT SETTINGS
// ===============================
exports.updateRestaurantSettings = async (req, res) => {
  try {
    if (!checkOwner(req, res)) return;

    const restaurant = await Restaurant.findOne({
      ownerId: req.user._id,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      name,
      type,
      logo,
      email,
      phone,
      address,
      openingTime,
      closingTime,

      // WEBSITE CUSTOMIZATION
      heroTitle,
      heroSubtitle,
      heroImage,
      aboutTitle,
      aboutText,
      instagram,
      facebook,

      // OPERATIONS
      acceptsOrders,
      acceptsReservations,

      // NOTIFICATIONS
      notificationPreferences,
    } = req.body;

    // ===============================
    // BASIC RESTAURANT DETAILS
    // ===============================

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Restaurant name cannot be empty",
        });
      }

      restaurant.name = String(name).trim();
    }

    if (type !== undefined) {
      restaurant.type = String(type).trim();
    }

    if (logo !== undefined) {
      restaurant.logo = String(logo).trim();
    }

    if (email !== undefined) {
      restaurant.email = String(email)
        .trim()
        .toLowerCase();
    }

    if (phone !== undefined) {
      restaurant.phone = String(phone).trim();
    }

    if (address !== undefined) {
      restaurant.address = String(address).trim();
    }

    // ===============================
    // OPENING HOURS
    // ===============================

    if (openingTime !== undefined) {
      restaurant.openingTime = openingTime;
    }

    if (closingTime !== undefined) {
      restaurant.closingTime = closingTime;
    }

    // ===============================
    // WEBSITE CUSTOMIZATION
    // ===============================

    if (heroTitle !== undefined) {
      restaurant.heroTitle =
        String(heroTitle).trim();
    }

    if (heroSubtitle !== undefined) {
      restaurant.heroSubtitle =
        String(heroSubtitle).trim();
    }

    if (heroImage !== undefined) {
      restaurant.heroImage =
        String(heroImage).trim();
    }

    if (aboutTitle !== undefined) {
      restaurant.aboutTitle =
        String(aboutTitle).trim();
    }

    if (aboutText !== undefined) {
      restaurant.aboutText =
        String(aboutText).trim();
    }

    if (instagram !== undefined) {
      restaurant.instagram =
        String(instagram).trim();
    }

    if (facebook !== undefined) {
      restaurant.facebook =
        String(facebook).trim();
    }

    // ===============================
    // RESTAURANT OPERATIONS
    // ===============================

    if (acceptsOrders !== undefined) {
      restaurant.acceptsOrders =
        Boolean(acceptsOrders);
    }

    if (acceptsReservations !== undefined) {
      restaurant.acceptsReservations =
        Boolean(acceptsReservations);
    }

    // ===============================
    // NOTIFICATION PREFERENCES
    // ===============================

    if (notificationPreferences !== undefined) {
      const currentPreferences =
        restaurant.notificationPreferences || {};

      restaurant.notificationPreferences = {
        newOrders:
          notificationPreferences.newOrders !==
          undefined
            ? Boolean(
                notificationPreferences.newOrders
              )
            : Boolean(
                currentPreferences.newOrders ??
                  true
              ),

        reservations:
          notificationPreferences.reservations !==
          undefined
            ? Boolean(
                notificationPreferences.reservations
              )
            : Boolean(
                currentPreferences.reservations ??
                  true
              ),

        inventoryAlerts:
          notificationPreferences.inventoryAlerts !==
          undefined
            ? Boolean(
                notificationPreferences.inventoryAlerts
              )
            : Boolean(
                currentPreferences.inventoryAlerts ??
                  true
              ),

        employeeUpdates:
          notificationPreferences.employeeUpdates !==
          undefined
            ? Boolean(
                notificationPreferences.employeeUpdates
              )
            : Boolean(
                currentPreferences.employeeUpdates ??
                  true
              ),
      };
    }

    // ===============================
    // SAVE
    // ===============================

    await restaurant.save();

    return res.json({
      success: true,
      message:
        "Restaurant settings updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "UPDATE RESTAURANT SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update restaurant settings",
    });
  }
};

// ===============================
// PUBLIC RESTAURANT WEBSITE
// Customer / Landing Page
// ===============================
exports.getPublicRestaurant = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    console.log(
      "PUBLIC WEBSITE SLUG:",
      slug
    );

    // ===============================
    // FIND RESTAURANT
    // ===============================

    const restaurant = await Restaurant.findOne({
      slug: slug,
    });

    console.log(
      "PUBLIC WEBSITE RESTAURANT:",
      restaurant
        ? {
            id: restaurant._id,
            name: restaurant.name,
            slug: restaurant.slug,
            isActive: restaurant.isActive,
            subscription:
              restaurant.subscription,
          }
        : null
    );

    // ===============================
    // RESTAURANT NOT FOUND
    // ===============================

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `Restaurant not found for slug: ${slug}`,
      });
    }

    // ===============================
    // RESTAURANT INACTIVE
    // ===============================

    if (restaurant.isActive === false) {
      return res.status(403).json({
        success: false,
        code: "RESTAURANT_INACTIVE",
        message:
          "This restaurant website is currently inactive.",
      });
    }

    // ===============================
    // SUBSCRIPTION CHECK
    // ===============================

    const subscription =
      restaurant.subscription;

    if (
      !subscription ||
      subscription.status !== "active" ||
      !subscription.endDate ||
      new Date(subscription.endDate) <=
        new Date()
    ) {
      return res.status(403).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        message:
          "This restaurant website subscription has expired.",
      });
    }

    // ===============================
    // RETURN PUBLIC DATA
    // ===============================

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "PUBLIC RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant",
    });
  }
};