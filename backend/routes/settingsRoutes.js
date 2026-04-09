const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getHSNCodes, createHSNCode, updateHSNCode, deleteHSNCode,
} = require("../controllers/hsnController");
const {
  getRoles, createRole, updateRole, deleteRole,
} = require("../controllers/roleController");

// HSN Routes
router.get("/hsn", protect, getHSNCodes);
router.post("/hsn", protect, adminOnly, createHSNCode);
router.put("/hsn/:id", protect, adminOnly, updateHSNCode);
router.delete("/hsn/:id", protect, adminOnly, deleteHSNCode);

// Role Routes
router.get("/roles", protect, getRoles);
router.post("/roles", protect, adminOnly, createRole);
router.put("/roles/:id", protect, adminOnly, updateRole);
router.delete("/roles/:id", protect, adminOnly, deleteRole);

module.exports = router;
