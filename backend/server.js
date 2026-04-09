const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const { seedCategories } = require("./controllers/categoryController");

const app = express();

// ✅ Connect DB
connectDB()
  .then(() => seedCategories())
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1);
  });

// ✅ CORS FIX (Vercel + Local)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://trade-catalog.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error("❌ CORS Blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/inquiries",  require("./routes/inquiryRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes")); // ← ADDED

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "TradeCatalog API is running ✅" });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ CRITICAL FIX FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});