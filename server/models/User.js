const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    restaurantName: {
      type: String,
      default: "",
      trim: true,
    },

    restaurantType: {
      type: String,
      default: "",
      trim: true,
    },

    // Owner ke restaurant se connection
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "owner",
        "customer",
        "manager",
        "waiter",
        "kitchen",
      ],
      required: true,
    },

    

    googleId: {
      type: String,
      default: "",
    },

    // Forgot Password OTP
    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);