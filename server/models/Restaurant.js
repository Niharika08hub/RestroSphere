const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

heroTitle: {
  type: String,
  default: "",
  trim: true,
},

heroSubtitle: {
  type: String,
  default: "",
  trim: true,
},

heroImage: {
  type: String,
  default: "",
},

aboutTitle: {
  type: String,
  default: "About Us",
  trim: true,
},

aboutText: {
  type: String,
  default: "",
  trim: true,
},

instagram: {
  type: String,
  default: "",
  trim: true,
},

facebook: {
  type: String,
  default: "",
  trim: true,
},

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    openingTime: {
      type: String,
      default: "10:00",
    },

    closingTime: {
      type: String,
      default: "23:00",
    },

    acceptsOrders: {
      type: Boolean,
      default: true,
    },

    acceptsReservations: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    subscription: {
      status: {
        type: String,
        enum: ["inactive", "pending", "active", "expired"],
        default: "inactive",
      },
      plan: {
        type: String,
        enum: ["monthly", "quarterly", "yearly", null],
        default: null,
      },
      amount: {
        type: Number,
        default: 0,
      },
      months: {
        type: Number,
        default: 0,
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      pendingOrderId: {
        type: String,
        default: "",
      },
      razorpayOrderId: {
        type: String,
        default: "",
      },
      razorpayPaymentId: {
        type: String,
        default: "",
      },
      razorpaySignature: {
        type: String,
        default: "",
      },
    },

    notificationPreferences: {
      newOrders: {
        type: Boolean,
        default: true,
      },
      reservations: {
        type: Boolean,
        default: true,
      },
      inventoryAlerts: {
        type: Boolean,
        default: true,
      },
      employeeUpdates: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
