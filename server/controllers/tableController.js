const Table = require("../models/Table");
const User = require("../models/User");

const {
  notifyRestaurantManagers,
} = require("../utils/notificationHelper");

// =====================================
// GET RESTAURANT ID
// =====================================

const Restaurant = require("../models/Restaurant");

const getRestaurantId = async (req) => {
  // Owner / staff already linked to restaurant
  if (req.user.restaurantId) {
    return req.user.restaurantId;
  }

  // Customer uses the active RestroSphere restaurant
  if (req.user.role === "customer") {
    const restaurant = await Restaurant.findOne({
      isActive: true,
    }).sort({ createdAt: 1 });

    return restaurant?._id || null;
  }

  // Owner fallback
  if (req.user.role === "owner") {
    return req.user.restaurantId || null;
  }

  return null;
};

// =====================================
// MIGRATE OLD TABLES
// =====================================

const migrateOldTables = async (req) => {
  const restaurantId =
    await getRestaurantId(req);

  if (!restaurantId) {
    return;
  }

  if (req.user.role === "manager") {
    const owner = await User.findOne({
      role: "owner",
      restaurantId,
    }).select("_id");

    if (!owner) {
      return;
    }

    await Table.updateMany(
      {
        restaurantId: owner._id,
      },
      {
        $set: {
          restaurantId,
        },
      }
    );
  }
};

// =====================================
// GET ALL TABLES
// OWNER + MANAGER
// =====================================

exports.getTables = async (req, res) => {
  try {
    const restaurantId =
      await getRestaurantId(req);

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    await migrateOldTables(req);

    const tables = await Table.find({
      restaurantId,
    }).sort({
      tableNumber: 1,
    });

    return res.json({
      success: true,
      tables,
    });
  } catch (error) {
    console.error(
      "GET TABLES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch tables",
    });
  }
};

// =====================================
// CREATE TABLE
// OWNER ONLY
// =====================================

exports.createTable = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message:
          "Owner access required",
      });
    }

    const restaurantId =
      await getRestaurantId(req);

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this owner account",
      });
    }

    const {
      tableNumber,
      capacity,
    } = req.body;

    if (
      tableNumber === undefined ||
      tableNumber === null ||
      String(tableNumber).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Table number is required",
      });
    }

    const existingTable =
      await Table.findOne({
        restaurantId,
        tableNumber,
      });

    if (existingTable) {
      return res.status(409).json({
        success: false,
        message:
          "This table already exists",
      });
    }

    const table =
      await Table.create({
        restaurantId,

        tableNumber,

        capacity:
          capacity || 4,

        status: "available",
      });

    // =================================
    // NOTIFY OWNER + MANAGERS
    // =================================

    await notifyRestaurantManagers({
      restaurantId,

      type: "table",

      title:
        "New Table Added",

      message:
        `Table ${table.tableNumber} has been added to the restaurant.`,

      referenceId:
        table._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Table created successfully",
      table,
    });
  } catch (error) {
    console.error(
      "CREATE TABLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create table",
    });
  }
};

// =====================================
// UPDATE TABLE STATUS
// OWNER + MANAGER
// =====================================

exports.updateTableStatus =
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      if (
        ![
          "available",
          "occupied",
          "reserved",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid table status",
        });
      }

      const restaurantId =
        await getRestaurantId(req);

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant is not linked to this account",
        });
      }

      await migrateOldTables(req);

      // Get current table first
      const existingTable =
        await Table.findOne({
          _id: req.params.id,
          restaurantId,
        });

      if (!existingTable) {
        return res.status(404).json({
          success: false,
          message:
            "Table not found",
        });
      }

      // Don't create duplicate notification
      // if the status is already the same.
      if (
        existingTable.status ===
        status
      ) {
        return res.json({
          success: true,
          message:
            "Table status is already updated",
          table: existingTable,
        });
      }

      const previousStatus =
        existingTable.status;

      existingTable.status =
        status;

      const table =
        await existingTable.save();

      // =================================
      // NOTIFICATION MESSAGE
      // =================================

      let notificationTitle =
        "Table Status Updated";

      let notificationMessage =
        `Table ${table.tableNumber} status changed from ${previousStatus} to ${status}.`;

      if (
        status === "reserved"
      ) {
        notificationTitle =
          "Table Reserved";

        notificationMessage =
          `Table ${table.tableNumber} has been reserved.`;
      }

      if (
        status === "occupied"
      ) {
        notificationTitle =
          "Table Occupied";

        notificationMessage =
          `Table ${table.tableNumber} is now occupied.`;
      }

      if (
        status === "available"
      ) {
        notificationTitle =
          "Table Available";

        notificationMessage =
          `Table ${table.tableNumber} is now available.`;
      }

      // =================================
      // NOTIFY OWNER + MANAGERS
      // =================================

      await notifyRestaurantManagers({
        restaurantId,

        type: "table",

        title:
          notificationTitle,

        message:
          notificationMessage,

        referenceId:
          table._id,
      });

      return res.json({
        success: true,
        message:
          "Table status updated",
        table,
      });
    } catch (error) {
      console.error(
        "UPDATE TABLE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update table",
      });
    }
  };

// =====================================
// DELETE TABLE
// OWNER ONLY
// =====================================

exports.deleteTable =
  async (req, res) => {
    try {
      if (req.user.role !== "owner") {
        return res.status(403).json({
          success: false,
          message:
            "Owner access required",
        });
      }

      const restaurantId =
        await getRestaurantId(req);

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message:
            "Restaurant is not linked to this owner account",
        });
      }

      await migrateOldTables(req);

      const table =
        await Table.findOneAndDelete({
          _id: req.params.id,
          restaurantId,
        });

      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "Table not found",
        });
      }

      // =================================
      // NOTIFY OWNER + MANAGERS
      // =================================

      await notifyRestaurantManagers({
        restaurantId,

        type: "table",

        title:
          "Table Deleted",

        message:
          `Table ${table.tableNumber} has been deleted from the restaurant.`,

        referenceId:
          table._id,
      });

      return res.json({
        success: true,
        message:
          "Table deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE TABLE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete table",
      });
    }
  };