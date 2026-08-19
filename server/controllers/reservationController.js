const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const {
  notifyRestaurantManagers,
} = require("../utils/notificationHelper");

// =====================================
// GET RESTAURANT ID
// =====================================

const getRestaurantId = async (req) => {
  // Owner / Manager / Staff already linked
  if (req.user.restaurantId) {
    return req.user.restaurantId;
  }

  // Customer belongs to the main active RestroSphere restaurant
  if (req.user.role === "customer") {
    const restaurant = await Restaurant.findOne({
      isActive: true,
    }).sort({ createdAt: 1 });

    return restaurant?._id || null;
  }

  return null;
};

// =====================================
// MIGRATE OLD RESERVATIONS
// =====================================
// Older reservations may have been saved using
// Owner._id instead of Restaurant._id.
//
// This converts them automatically.

const migrateOldReservations = async (req) => {
  const restaurantId =
    await getRestaurantId(req);

  if (!restaurantId) {
    return;
  }

  const owner = await User.findOne({
    role: "owner",
    restaurantId,
  }).select("_id");

  if (!owner) {
    return;
  }

  await Reservation.updateMany(
    {
      restaurantId: owner._id,
    },
    {
      $set: {
        restaurantId,
      },
    }
  );
};

// =====================================
// GET RESERVATIONS
// OWNER + MANAGER
// =====================================

exports.getReservations = async (
  req,
  res
) => {
  try {
    const restaurantId =
      req.user.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is not linked to this account",
      });
    }

    // Find the owner of this restaurant
    const owner = await User.findOne({
      role: "owner",
      restaurantId,
    }).select("_id");

    const restaurantIds = [
      restaurantId,
    ];

    // Support old reservations that were saved
    // using Owner User._id
    if (owner?._id) {
      restaurantIds.push(owner._id);
    }

    const reservations =
      await Reservation.find({
        restaurantId: {
          $in: restaurantIds,
        },
      })
        .populate(
          "customerId",
          "name fullName email"
        )
        .populate(
          "tableId",
          "tableNumber capacity"
        )
        .sort({
          reservationDate: 1,
          createdAt: -1,
        });

    // Automatically migrate old reservations
    if (owner?._id) {
      await Reservation.updateMany(
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

    return res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error(
      "GET RESERVATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch reservations",
    });
  }
};

// =====================================
// CREATE RESERVATION
// =====================================

exports.createReservation = async (
  req,
  res
) => {
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

const {
  tableId,
  reservationDate,
  time,
  guests,
  notes,
} = req.body;

const customerId = req.user._id;

   if (
  !tableId ||
  !reservationDate ||
  !time ||
  !guests
) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, table, date, time and guests are required",
      });
    }

    // =================================
    // FIND TABLE
    // =================================

    const table =
      await Table.findOne({
        _id: tableId,
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
    // CHECK CAPACITY
    // =================================

    if (
      Number(guests) >
      table.capacity
    ) {
      return res.status(400).json({
        success: false,
        message: `This table can accommodate maximum ${table.capacity} guests`,
      });
    }

    // =================================
    // CHECK EXISTING RESERVATION
    // =================================

    const existingReservation =
      await Reservation.findOne({
        restaurantId,
        tableId,
        reservationDate:
          new Date(reservationDate),
        time,
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      });

    if (existingReservation) {
      return res.status(409).json({
        success: false,
        message:
          "This table is already reserved for this time",
      });
    }

    // =================================
    // CREATE RESERVATION
    // =================================

    const reservation =
      await Reservation.create({
        restaurantId,
        customerId,
        tableId,
        reservationDate:
          new Date(reservationDate),
        time,
        guests: Number(guests),
        notes: notes || "",
        status: "pending",
      });

    // =================================
    // MARK TABLE RESERVED
    // =================================

    await Table.findOneAndUpdate(
      {
        _id: tableId,
        restaurantId,
      },
      {
        status: "reserved",
      }
    );

    const populatedReservation =
      await Reservation.findById(
        reservation._id
      )
        .populate(
          "customerId",
          "name fullName email"
        )
        .populate(
          "tableId",
          "tableNumber capacity"
        );

    // =================================
    // NOTIFY OWNER + MANAGERS
    // =================================

    await notifyRestaurantManagers({
      restaurantId,

      type: "reservation",

      title:
        "New Reservation",

      message: `A new reservation has been created for ${guests} guests at ${time}.`,

      referenceId:
        reservation._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Reservation created successfully",
      reservation:
        populatedReservation,
    });
  } catch (error) {
    console.error(
      "CREATE RESERVATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create reservation",
    });
  }
};

// =====================================
// UPDATE RESERVATION STATUS
// OWNER + MANAGER
// =====================================

exports.updateReservationStatus =
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid reservation status",
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

      // Fix old records
      await migrateOldReservations(req);

      const reservation =
        await Reservation.findOne({
          _id: req.params.id,
          restaurantId,
        });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message:
            "Reservation not found",
        });
      }

      // =================================
      // UPDATE STATUS
      // =================================

      reservation.status = status;

      await reservation.save();

      // =================================
      // NOTIFICATION MESSAGE
      // =================================

      let notificationTitle =
        "Reservation Updated";

      let notificationMessage =
        `Reservation status changed to ${status}.`;

      if (
        status ===
        "confirmed"
      ) {
        notificationTitle =
          "Reservation Confirmed";

        notificationMessage =
          `Reservation for ${reservation.guests} guests at ${reservation.time} has been confirmed.`;
      }

      if (
        status ===
        "cancelled"
      ) {
        notificationTitle =
          "Reservation Cancelled";

        notificationMessage =
          `Reservation for ${reservation.guests} guests at ${reservation.time} has been cancelled.`;
      }

      if (
        status ===
        "completed"
      ) {
        notificationTitle =
          "Reservation Completed";

        notificationMessage =
          `Reservation for ${reservation.guests} guests at ${reservation.time} has been completed.`;
      }

      if (
        status ===
        "pending"
      ) {
        notificationTitle =
          "Reservation Pending";

        notificationMessage =
          `Reservation for ${reservation.guests} guests at ${reservation.time} is pending.`;
      }

      // =================================
      // NOTIFY OWNER + MANAGERS
      // =================================

      await notifyRestaurantManagers({
        restaurantId,

        type: "reservation",

        title:
          notificationTitle,

        message:
          notificationMessage,

        referenceId:
          reservation._id,
      });

      // =================================
      // RESERVE TABLE
      // =================================

      if (
        status === "confirmed" ||
        status === "pending"
      ) {
        await Table.findOneAndUpdate(
          {
            _id:
              reservation.tableId,

            restaurantId,
          },
          {
            status:
              "reserved",
          }
        );
      }

      // =================================
      // FREE TABLE
      // =================================

      if (
        status === "cancelled" ||
        status === "completed"
      ) {
        await Table.findOneAndUpdate(
          {
            _id:
              reservation.tableId,

            restaurantId,
          },
          {
            status:
              "available",
          }
        );
      }

      const updatedReservation =
        await Reservation.findById(
          reservation._id
        )
          .populate(
            "customerId",
            "name fullName email"
          )
          .populate(
            "tableId",
            "tableNumber capacity"
          );

      return res.json({
        success: true,
        message:
          "Reservation status updated",
        reservation:
          updatedReservation,
      });
    } catch (error) {
      console.error(
        "UPDATE RESERVATION STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update reservation status",
      });
    }
  };

// =====================================
// DELETE RESERVATION
// OWNER ONLY
// =====================================

exports.deleteReservation =
  async (req, res) => {
    try {
      // Manager should NOT delete reservations
      if (
        req.user.role ===
        "manager"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Manager cannot delete reservations",
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

      // Fix old records
      await migrateOldReservations(req);

      const reservation =
        await Reservation.findOneAndDelete(
          {
            _id: req.params.id,
            restaurantId,
          }
        );

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message:
            "Reservation not found",
        });
      }

      // Free table
      await Table.findOneAndUpdate(
        {
          _id:
            reservation.tableId,

          restaurantId,
        },
        {
          status:
            "available",
        }
      );

      return res.json({
        success: true,
        message:
          "Reservation deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE RESERVATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete reservation",
      });
    }
  };

  // ===============================
// PUBLIC RESTAURANT BY SLUG
// ===============================
exports.getPublicRestaurant = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Restaurant slug is required",
      });
    }

    const restaurant = await Restaurant.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).select(
      "_id name slug type logo phone address openingTime closingTime acceptsOrders acceptsReservations"
    );

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
      "GET PUBLIC RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch restaurant",
    });
  }
};

// =====================================
// GET CUSTOMER RESERVATIONS
// =====================================

exports.getCustomerReservations = async (req, res) => {
  try {
    const restaurantId = await getRestaurantId(req);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: "No active RestroSphere restaurant found",
      });
    }

    const reservations = await Reservation.find({
      restaurantId,
      customerId: req.user._id,
    })
      .populate(
        "tableId",
        "tableNumber capacity status"
      )
      .sort({
        reservationDate: -1,
        createdAt: -1,
      });

    return res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER RESERVATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your reservations",
    });
  }
};