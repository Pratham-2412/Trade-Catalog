const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const { seedCategories } = require("./controllers/categoryController");

const app = express();

// ✅ Database connection
connectDB()
  .then(() => seedCategories())
  .catch((err) => console.error("Database connection error:", err));

// ✅ Standard Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes (Original Structure)
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/settings",   require("./routes/settingsRoutes"));
app.use("/api/inquiries",  require("./routes/inquiryRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));

// ✅ Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Original Server running on port ${PORT}`);
});