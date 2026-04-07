const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    name: {
      type:     String,
      required: [true, "Product name is required"],
      trim:     true,
    },
    description: {
      type:     String,
      required: [true, "Product description is required"],
      trim:     true,
    },
    shortDescription: {
      type:  String,
      trim:  true,
      default: "",
    },

    // ── Category ──
    category: {
      type:     String,
      required: [true, "Category is required"],
      trim:     true,
    },

    // ── Pricing ──
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    currency: {
      type:    String,
      default: "USD",
      enum:    ["USD", "EUR", "GBP", "INR", "AED", "CNY", "JPY"],
    },
    priceUnit: {
      type:    String,
      default: "",
    },

    // ── Trade Info ──
    unit: {
      type:    String,
      default: "piece",
      trim:    true,
    },
    minOrderQuantity: {
      type:    Number,
      default: 1,
      min:     [1, "MOQ must be at least 1"],
    },
    maxOrderQuantity: {
      type:    Number,
      default: 0, // 0 = unlimited
    },
    origin: {
      type:    String,
      trim:    true,
      default: "",
    },
    hsCode: {
      type:    String,
      trim:    true,
      default: "",
    },
    leadTime: {
      type:    String,
      default: "", // e.g. "7-10 days"
    },
    paymentTerms: {
      type:    String,
      default: "", // e.g. "T/T, L/C"
    },
    certifications: {
      type:    [String],
      default: [],
    },

    // ── Stock ──
    stockStatus: {
      type:    String,
      enum:    ["in_stock", "out_of_stock", "limited"],
      default: "in_stock",
    },

    // ── Media ──
    imageUrl: {
      type:    String,
      default: "",
    },
    images: {
      type:    [String],
      default: [],
    },
    pdfUrl: {
      type:    String,
      default: "",
    },

    // ── Extra ──
    tags: {
      type:    [String],
      default: [],
    },
    specifications: {
      type:    [specificationSchema],
      default: [],
    },

    // ── Featured ──
    isFeatured: {
      type:    Boolean,
      default: false,
    },

    // ── Bulk Upload ──
    isBulkUploaded: {
      type:    Boolean,
      default: false,
    },

    // ── Stats ──
    views: {
      type:    Number,
      default: 0,
    },
    inquiryCount: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Text search index ──
productSchema.index({
  name:        "text",
  description: "text",
  category:    "text",
  tags:        "text",
  origin:      "text",
});

module.exports = mongoose.model("Product", productSchema);