const Menu = require("../models/Menu");
const Restaurant = require("../models/Restaurant");

const {
  notifyRestaurantManagers,
} = require("../utils/notificationHelper");

// ===============================
// GET MENU
// OWNER + MANAGER
// ===============================
exports.getMenu = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (!req.user.restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    const allowedRoles = [
      "owner",
      "manager",
    ];

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access menu management",
      });
    }

    const items = await Menu.find({
      restaurantId:
        req.user.restaurantId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error(
      "GET MENU ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch menu",
    });
  }
};

// ===============================
// ADD MENU ITEM
// OWNER ONLY
// ===============================
exports.addMenuItem = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      req.user.role !== "owner"
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
      name,
      description,
      price,
      category,
      image,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, price and category are required",
      });
    }

    const item =
      await Menu.create({
        restaurantId:
          req.user.restaurantId,

        name,

        description:
          description || "",

        price:
          Number(price),

        category,

        image:
          image || "",

        isAvailable: true,
      });

    // =================================
    // NOTIFY OWNER + MANAGERS
    // =================================

    await notifyRestaurantManagers({
      restaurantId:
        req.user.restaurantId,

      type: "menu",

      title:
        "New Menu Item Added",

      message:
        `${item.name} has been added to the menu.`,

      referenceId:
        item._id,
    });

    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error(
      "ADD MENU ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add menu item",
    });
  }
};

// ===============================
// UPDATE MENU ITEM
// OWNER + MANAGER
// ===============================
exports.updateMenuItem =
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      if (!req.user.restaurantId) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant is not linked to this account",
        });
      }

      const allowedRoles = [
        "owner",
        "manager",
      ];

      if (
        !allowedRoles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to update menu",
        });
      }

      const item =
        await Menu.findOne({
          _id: req.params.id,
          restaurantId:
            req.user.restaurantId,
        });

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }

      const {
        name,
        description,
        price,
        category,
        image,
        rating,
        veg,
        isAvailable,
      } = req.body;

      // =================================
      // SAVE OLD VALUES
      // =================================

      const oldName =
        item.name;

      const oldAvailability =
        item.isAvailable;

      // =================================
      // MANAGER
      // =================================

      if (
        req.user.role ===
        "manager"
      ) {
        if (
          name !== undefined
        ) {
          item.name =
            name;
        }

        if (
          description !==
          undefined
        ) {
          item.description =
            description;
        }

        if (
          price !== undefined
        ) {
          item.price =
            Number(price);
        }

        if (
          category !== undefined
        ) {
          item.category =
            category;
        }

        if (
          image !== undefined
        ) {
          item.image =
            image;
        }

        if (
          isAvailable !==
          undefined
        ) {
          item.isAvailable =
            Boolean(
              isAvailable
            );
        }

        await item.save();

        // =================================
        // AVAILABILITY NOTIFICATION
        // =================================

        if (
          isAvailable !==
            undefined &&
          oldAvailability !==
            item.isAvailable
        ) {
          if (
            item.isAvailable
          ) {
            await notifyRestaurantManagers({
              restaurantId:
                req.user
                  .restaurantId,

              type: "menu",

              title:
                "Menu Item Available",

              message:
                `${item.name} is now available on the menu.`,

              referenceId:
                item._id,
            });
          } else {
            await notifyRestaurantManagers({
              restaurantId:
                req.user
                  .restaurantId,

              type: "menu",

              title:
                "Menu Item Unavailable",

              message:
                `${item.name} is now unavailable on the menu.`,

              referenceId:
                item._id,
            });
          }
        } else {
          // =================================
          // GENERAL UPDATE
          // =================================

          await notifyRestaurantManagers({
            restaurantId:
              req.user
                .restaurantId,

            type: "menu",

            title:
              "Menu Item Updated",

            message:
              `${oldName} has been updated in the menu.`,

            referenceId:
              item._id,
          });
        }

        return res.json({
          success: true,
          data: item,
        });
      }

      // =================================
      // OWNER
      // =================================

      if (
        name !== undefined
      ) {
        item.name =
          name;
      }

      if (
        description !==
        undefined
      ) {
        item.description =
          description;
      }

      if (
        price !== undefined
      ) {
        item.price =
          Number(price);
      }

      if (
        category !== undefined
      ) {
        item.category =
          category;
      }

      if (
        image !== undefined
      ) {
        item.image =
          image;
      }

      if (
        rating !== undefined
      ) {
        item.rating =
          Number(rating);
      }

      if (
        veg !== undefined
      ) {
        item.veg =
          Boolean(veg);
      }

      if (
        isAvailable !==
        undefined
      ) {
        item.isAvailable =
          Boolean(
            isAvailable
          );
      }

      await item.save();

      // =================================
      // AVAILABILITY NOTIFICATION
      // =================================

      if (
        isAvailable !==
          undefined &&
        oldAvailability !==
          item.isAvailable
      ) {
        if (
          item.isAvailable
        ) {
          await notifyRestaurantManagers({
            restaurantId:
              req.user
                .restaurantId,

            type: "menu",

            title:
              "Menu Item Available",

            message:
              `${item.name} is now available on the menu.`,

            referenceId:
              item._id,
          });
        } else {
          await notifyRestaurantManagers({
            restaurantId:
              req.user
                .restaurantId,

            type: "menu",

            title:
              "Menu Item Unavailable",

            message:
              `${item.name} is now unavailable on the menu.`,

            referenceId:
              item._id,
          });
        }
      } else {
        // =================================
        // GENERAL UPDATE
        // =================================

        await notifyRestaurantManagers({
          restaurantId:
            req.user
              .restaurantId,

          type: "menu",

          title:
            "Menu Item Updated",

          message:
            `${oldName} has been updated in the menu.`,

          referenceId:
            item._id,
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error(
        "UPDATE MENU ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update menu item",
      });
    }
  };

// ===============================
// DELETE MENU ITEM
// OWNER ONLY
// ===============================
exports.deleteMenuItem =
  async (req, res) => {
    try {
      if (
        !req.user ||
        req.user.role !== "owner"
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

      const item =
        await Menu.findOneAndDelete({
          _id: req.params.id,
          restaurantId:
            req.user.restaurantId,
        });

      if (!item) {
        return res.status(404).json({
          success: false,
          message:
            "Menu item not found",
        });
      }

      // =================================
      // DELETE NOTIFICATION
      // =================================

      await notifyRestaurantManagers({
        restaurantId:
          req.user.restaurantId,

        type: "menu",

        title:
          "Menu Item Removed",

        message:
          `${item.name} has been removed from the menu.`,

        referenceId:
          item._id,
      });

      return res.json({
        success: true,
        message:
          "Menu item deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE MENU ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete menu item",
      });
    }
  };

// ===============================
// PUBLIC MENU BY RESTAURANT
// Customer / Landing Page
// ===============================
exports.getPublicMenu = async (req, res) => {
  try {
    const { restaurantId, slug } = req.query;

    let restaurant;

    // 1. If restaurantId is explicitly provided, use it
    if (restaurantId) {
      restaurant = await Restaurant.findOne({
        _id: restaurantId,
        isActive: true,
      });
    }

    // 2. If slug is provided, use the restaurant slug
    if (!restaurant && slug) {
      restaurant = await Restaurant.findOne({
        slug: String(slug).toLowerCase().trim(),
        isActive: true,
      });
    }

    // 3. CUSTOMER FALLBACK
    // Customer does not need restaurantId.
    // Use the active RestroSphere restaurant.
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        isActive: true,
      }).sort({
        createdAt: 1,
      });
    }

    // No active restaurant exists
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No active RestroSphere restaurant found",
      });
    }

    // Get only currently available menu items
    const items = await Menu.find({
      restaurantId: restaurant._id,
      isAvailable: true,
    }).sort({
      createdAt: 1,
    });

    return res.json({
      success: true,

      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        type: restaurant.type,
        logo: restaurant.logo,
      },

      data: items,
    });
  } catch (error) {
    console.error(
      "PUBLIC MENU ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch menu",
    });
  }
};