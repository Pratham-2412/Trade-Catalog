const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  true,
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    displayName: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      type:    [String],
      default: ["view_products"], // Default permission
    },
    isDefault: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
