const express = require("express");
const router  = express.Router();

const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Public ──
router.get("/",          getCategories);
router.get("/:slug",     getCategoryBySlug);

// ── Admin Only ──
router.post("/",         protect, adminOnly, createCategory);
router.put("/:id",       protect, adminOnly, updateCategory);
router.delete("/:id",    protect, adminOnly, deleteCategory);

module.exports = router;