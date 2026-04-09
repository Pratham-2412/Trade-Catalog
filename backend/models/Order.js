const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Product",
    required: true,
  },
  productName:  { type: String, required: true },
  productImage: { type: String, default: ""    },
  category:     { type: String, default: ""    },
  price:        { type: Number, required: true  },
  currency:     { type: String, default: "INR"  },
  quantity:     { type: Number, required: true  },
  unit:         { type: String, default: "piece"},
  totalPrice:   { type: Number, required: true  },
}, { _id: false });

const shippingSchema = new mongoose.Schema({
  fullName:    { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, required: true },
  address:     { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  country:     { type: String, required: true },
  pincode:     { type: String, required: true },
  company:     { type: String, default: ""    },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    // ── Order Info ──
    orderNumber: {
      type:   String,
      unique: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // ── Items ──
    items: [orderItemSchema],

    // ── Shipping ──
    shippingAddress: shippingSchema,

    // ── Payment ──
    paymentMethod: {
      type:    String,
      default: "razorpay",
    },
    razorpayOrderId:   { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },

    // ── Amounts ──
    subtotal:     { type: Number, required: true },
    tax:          { type: Number, default: 0     },
    shippingCost: { type: Number, default: 0     },
    totalAmount:  { type: Number, required: true },
    currency:     { type: String, default: "INR" },

    // ── Status ──
    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type:    String,
      enum:    [
        "pending", "confirmed", "processing",
        "shipped", "delivered", "cancelled",
      ],
      default: "pending",
    },

    // ── Notes ──
    notes:         { type: String, default: "" },
    adminNotes:    { type: String, default: "" },
    trackingNumber:{ type: String, default: "" },
    invoiceUrl:    { type: String, default: "" },

    // ── Timestamps ──
    paidAt:      { type: Date },
    shippedAt:   { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// ── Auto generate order number ──
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count      = await mongoose.model("Order").countDocuments();
    const date       = new Date();
    const year       = date.getFullYear().toString().slice(-2);
    const month      = String(date.getMonth() + 1).padStart(2, "0");
    this.orderNumber = `TC${year}${month}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);