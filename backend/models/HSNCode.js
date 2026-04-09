const mongoose = require("mongoose");

const hsnCodeSchema = new mongoose.Schema(
  {
    code: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    description: {
      type: String,
      trim: true,
    },
    gstRate: {
      type:    Number,
      default: 18, // Default GST rate
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HSNCode", hsnCodeSchema);
