const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    productName: {
      type:  String,
      default: "",
    },

    // ── Sender Info ──
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
    },
    email: {
      type:     String,
      required: [true, "Email is required"],
      trim:     true,
      lowercase: true,
    },
    phone: {
      type:    String,
      default: "",
      trim:    true,
    },
    company: {
      type:    String,
      default: "",
      trim:    true,
    },
    country: {
      type:    String,
      default: "",
      trim:    true,
    },

    // ── Inquiry Details ──
    message: {
      type:     String,
      required: [true, "Message is required"],
      trim:     true,
    },
    quantity: {
      type:    Number,
      default: 0,
    },
    unit: {
      type:    String,
      default: "",
    },

    // ── Status ──
    status: {
      type:    String,
      enum:    ["new", "read", "replied", "closed"],
      default: "new",
    },

    // ── User (if logged in) ──
    user: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);