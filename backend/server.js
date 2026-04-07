const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const connectDB                    = require("./config/db");
const { seedCategories }           = require("./controllers/categoryController");

const app = express();

// Connect DB + seed categories
connectDB().then(() => seedCategories());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/categories",require("./routes/categoryRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "TradeCatalog API is running ✅" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});