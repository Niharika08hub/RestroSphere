const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type:String,
      required:true,
      trim:true,
    },
    price: {
      type:Number,
      required:true,
      min:0,
    },
    quantity: {
      type:Number,
      required:true,
      min:1,
    },
  },
  { _id:false }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Restaurant",
      required:true,
      index:true,
    },

    customerId: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      default:null,
      index:true,
    },

    tableNumber: {
  type: String,
  default: "",
  trim: true,
},

    customerName: {
      type:String,
      default:"Guest",
      trim:true,
    },

    orderNumber: {
      type:String,
      trim:true,
      index:true,
    },

    tableNumber: {
      type:String,
      default:"",
      trim:true,
    },

    specialInstructions: {
      type:String,
      default:"",
      trim:true,
    },

    items: {
      type:[orderItemSchema],
      required:true,
    },

    totalAmount: {
      type:Number,
      required:true,
      min:0,
    },

    status: {
      type:String,
      enum:["pending","preparing","ready","completed","cancelled"],
      default:"pending",
      index:true,
    },

    paymentStatus: {
      type:String,
      enum:["pending","paid","failed"],
      default:"pending",
    },
  },
  { timestamps:true }
);

// Generate a readable order number without changing existing _id behavior.
orderSchema.pre("validate", function () {
  if (!this.orderNumber && this._id) {
    this.orderNumber = this._id
      .toString()
      .slice(-6)
      .toUpperCase();
  }
});

module.exports = mongoose.model("Order", orderSchema);
