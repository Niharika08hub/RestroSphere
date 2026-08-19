const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      default: 4,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Table", tableSchema);