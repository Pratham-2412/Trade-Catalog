const express = require("express");
const router  = express.Router();

const {
  createInquiry,
  getInquiries,
  getProductInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Public ──
router.post("/products/:productId", createInquiry);

// ── Admin Only ──
router.get("/",                          protect, adminOnly, getInquiries);
router.get("/products/:productId",       protect, adminOnly, getProductInquiries);
router.put("/:id/status",               protect, adminOnly, updateInquiryStatus);
router.delete("/:id",                   protect, adminOnly, deleteInquiry);

module.exports = router;