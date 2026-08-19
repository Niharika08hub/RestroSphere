const Inventory = require("../models/Inventory");

const {
  notifyRestaurantManagers,
} = require("../utils/notificationHelper");

// ===============================
// GET ALL INVENTORY ITEMS
// OWNER + MANAGER
// ===============================
exports.getInventory = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !["owner", "manager"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access inventory",
      });
    }

    if (!req.user.restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    const inventory =
      await Inventory.find({
        restaurantId:
          req.user.restaurantId,
      }).sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(
      "GET INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch inventory",
    });
  }
};

// ===============================
// CREATE INVENTORY ITEM
// OWNER ONLY
// ===============================
exports.createInventory = async (
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
      itemName,
      category,
      quantity,
      unit,
      minimumStock,
      supplier,
      price,
    } = req.body;

    if (
      !itemName ||
      !category ||
      quantity === undefined ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Item name, category, quantity and unit are required",
      });
    }

    const item =
      await Inventory.create({
        restaurantId:
          req.user.restaurantId,

        itemName,

        category,

        quantity:
          Number(quantity),

        unit,

        minimumStock:
          minimumStock !==
          undefined
            ? Number(minimumStock)
            : 5,

        supplier:
          supplier || "",

        price:
          price !== undefined
            ? Number(price)
            : 0,
      });

    // =====================================
    // STOCK NOTIFICATION
    // =====================================

    const currentQuantity =
      Number(item.quantity || 0);

    const minimum =
      Number(item.minimumStock || 0);

    // OUT OF STOCK
    if (
      currentQuantity === 0
    ) {
      await createInventoryNotification(
        req,
        item,
        "Out of Stock",
        `${item.itemName} is out of stock.`
      );
    }

    // LOW STOCK
    else if (
      currentQuantity <=
      minimum
    ) {
      await createInventoryNotification(
        req,
        item,
        "Low Stock Alert",
        `${item.itemName} is low on stock. Only ${currentQuantity} ${item.unit} remaining.`
      );
    }

    // NEW INVENTORY ITEM
    else {
      await createInventoryNotification(
        req,
        item,
        "New Inventory Item",
        `${item.itemName} has been added to restaurant inventory.`
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Inventory item created successfully",
      data: item,
    });
  } catch (error) {
    console.error(
      "CREATE INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create inventory item",
    });
  }
};

// ===============================
// UPDATE INVENTORY ITEM
// OWNER + MANAGER
// ===============================
exports.updateInventory = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    if (
      !["owner", "manager"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update inventory",
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
      await Inventory.findOne({
        _id: req.params.id,
        restaurantId:
          req.user.restaurantId,
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory item not found",
      });
    }

    const {
      itemName,
      category,
      quantity,
      unit,
      minimumStock,
      supplier,
      price,
    } = req.body;

    const oldQuantity =
      Number(item.quantity || 0);

    const oldMinimumStock =
      Number(
        item.minimumStock || 0
      );

    // =====================================
    // MANAGER
    // =====================================
    // Manager can manage:
    // quantity
    // minimum stock
    // unit
    //
    // Manager cannot modify:
    // supplier
    // price
    // item identity/category
    // =====================================

    if (
      req.user.role ===
      "manager"
    ) {
      if (
        quantity !== undefined
      ) {
        item.quantity =
          Number(quantity);
      }

      if (
        minimumStock !==
        undefined
      ) {
        item.minimumStock =
          Number(
            minimumStock
          );
      }

      if (
        unit !== undefined
      ) {
        item.unit = unit;
      }
    }

    // =====================================
    // OWNER
    // =====================================

    if (
      req.user.role ===
      "owner"
    ) {
      if (
        itemName !== undefined
      ) {
        item.itemName =
          itemName;
      }

      if (
        category !== undefined
      ) {
        item.category =
          category;
      }

      if (
        quantity !== undefined
      ) {
        item.quantity =
          Number(quantity);
      }

      if (
        unit !== undefined
      ) {
        item.unit =
          unit;
      }

      if (
        minimumStock !==
        undefined
      ) {
        item.minimumStock =
          Number(
            minimumStock
          );
      }

      if (
        supplier !== undefined
      ) {
        item.supplier =
          supplier;
      }

      if (
        price !== undefined
      ) {
        item.price =
          Number(price);
      }
    }

    await item.save();

    // =====================================
    // STOCK NOTIFICATIONS
    // =====================================

    const newQuantity =
      Number(item.quantity || 0);

    const newMinimumStock =
      Number(
        item.minimumStock || 0
      );

    // =====================================
    // OUT OF STOCK
    // =====================================

    if (
      newQuantity === 0 &&
      oldQuantity !== 0
    ) {
      await createInventoryNotification(
        req,
        item,
        "Out of Stock",
        `${item.itemName} is now out of stock.`
      );
    }

    // =====================================
    // STOCK RESTORED
    // =====================================

    else if (
      oldQuantity === 0 &&
      newQuantity > 0
    ) {
      await createInventoryNotification(
        req,
        item,
        "Stock Restored",
        `${item.itemName} is back in stock with ${newQuantity} ${item.unit} available.`
      );
    }

    // =====================================
    // LOW STOCK
    // =====================================

    else if (
      newQuantity > 0 &&
      newQuantity <=
        newMinimumStock &&
      (
        oldQuantity >
          oldMinimumStock ||
        newMinimumStock !==
          oldMinimumStock
      )
    ) {
      await createInventoryNotification(
        req,
        item,
        "Low Stock Alert",
        `${item.itemName} is low on stock. Only ${newQuantity} ${item.unit} remaining.`
      );
    }

    // =====================================
    // NORMAL QUANTITY UPDATE
    // =====================================

    else if (
      newQuantity !==
      oldQuantity
    ) {
      await createInventoryNotification(
        req,
        item,
        "Inventory Updated",
        `${item.itemName} stock has been updated to ${newQuantity} ${item.unit}.`
      );
    }

    return res.json({
      success: true,
      message:
        "Inventory item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error(
      "UPDATE INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update inventory item",
    });
  }
};

// ===============================
// DELETE INVENTORY ITEM
// OWNER ONLY
// ===============================
exports.deleteInventory = async (
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

    const item =
      await Inventory.findOneAndDelete({
        _id: req.params.id,
        restaurantId:
          req.user.restaurantId,
      });

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory item not found",
      });
    }

    // =====================================
    // DELETE NOTIFICATION
    // =====================================

    await createInventoryNotification(
      req,
      item,
      "Inventory Item Removed",
      `${item.itemName} has been removed from restaurant inventory.`
    );

    return res.json({
      success: true,
      message:
        "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE INVENTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete inventory item",
    });
  }
};

// ===============================
// CREATE INVENTORY NOTIFICATION
// ===============================

const createInventoryNotification =
  async (
    req,
    item,
    title,
    message
  ) => {
    try {
      await notifyRestaurantManagers({
        restaurantId:
          req.user.restaurantId,

        type: "inventory",

        title,

        message,

        referenceId:
          item._id,
      });
    } catch (error) {
      console.error(
        "INVENTORY NOTIFICATION ERROR:",
        error
      );
    }
  };