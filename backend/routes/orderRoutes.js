const express = require("express");
const router  = express.Router();

const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  generateInvoice,
  getOrderStats,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// ── User Routes ──
router.post("/create",          protect, createOrder);
router.post("/verify",          protect, verifyPayment);
router.get("/my-orders",        protect, getMyOrders);
router.get("/:id",              protect, getOrderById);
router.get("/:id/invoice",      protect, generateInvoice);

// ── Admin Routes ──
router.get("/",                 protect, adminOnly, getAllOrders);
router.get("/admin/stats",      protect, adminOnly, getOrderStats);
router.put("/:id/status",       protect, adminOnly, updateOrderStatus);

module.exports = router;