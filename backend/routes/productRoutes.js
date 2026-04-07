const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductPDF,
} = require("../controllers/productController");

const { bulkUploadProducts } = require("../controllers/bulkUploadController");
const { handleUploadProduct, handleUploadCSV } = require("../middleware/upload");
const { protect, adminOnly, managerOrAdmin } = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getProducts);
router.get("/:id/pdf", downloadProductPDF);
router.get("/:id", getProductById);

// Manager or Admin
router.post("/", protect, managerOrAdmin, handleUploadProduct, createProduct);
router.put("/:id", protect, managerOrAdmin, handleUploadProduct, updateProduct);
router.post("/bulk-upload", protect, managerOrAdmin, handleUploadCSV, bulkUploadProducts);

// Admin Only
router.delete("/:id", protect, adminOnly, deleteProduct);

// Export CSV
router.get("/export/csv", protect, managerOrAdmin, async (req, res) => {
  try {
    const Product = require("../models/Product");
    const products = await Product.find({});
    const headers = [
      "name",
      "description",
      "category",
      "price",
      "currency",
      "unit",
      "minOrderQuantity",
      "origin",
      "hsCode",
      "tags",
    ];

    const rows = products.map((p) =>
      [
        p.name,
        p.description,
        p.category,
        p.price,
        p.currency,
        p.unit,
        p.minOrderQuantity,
        p.origin,
        p.hsCode,
        p.tags.join("|"),
      ].map((v) => `"${v}"`).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tradecatalog_export.csv"
    );

    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;