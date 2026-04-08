const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const connectDB          = require("./config/db");
const { seedCategories } = require("./controllers/categoryController");

const app = express();

// Connect DB
connectDB().then(() => seedCategories());

// ── CORS Fix ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://trade-catalog.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials:      true,
  methods:          ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders:   ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/inquiries",  require("./routes/inquiryRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));

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