const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    // Restaurant owner
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Customer who made the reservation
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reserved table
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    // Reservation date
    reservationDate: {
      type: Date,
      required: true,
    },

    // Reservation time - e.g. "07:30 PM"
    time: {
      type: String,
      required: true,
      trim: true,
    },

    // Number of guests
    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    // Optional customer note
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // Reservation status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Helps fetch reservations efficiently
reservationSchema.index({
  restaurantId: 1,
  reservationDate: 1,
});

// Prevents two reservations for the same
// restaurant + table + date + time
reservationSchema.index(
  {
    restaurantId: 1,
    tableId: 1,
    reservationDate: 1,
    time: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Reservation",
  reservationSchema
);