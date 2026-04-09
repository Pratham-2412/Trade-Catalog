const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅ 1. DATABASE (Ensuring it connects for the bypass)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🟢 DB CONNECTED"))
  .catch(err => console.error("🔴 DB ERROR:", err));

app.use(cors());
app.use(express.json());

// 🧪 EMERGENCY BYPASS (Defined directly here because Render is using this file)
app.get("/api/auth/force-update", async (req, res) => {
  try {
    const { userId, role } = req.query;
    console.log("⚡ BYPASS HIT IN BACKEND FOLDER:", userId, role);
    // Dynamic role update (no schema needed for direct mongo call)
    await mongoose.connection.db.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { role: role } }
    );
    res.send(`<h1>✅ Success! Role changed to ${role}</h1><script>setTimeout(() => window.location.href='/admin/users', 1000)</script>`);
  } catch (err) { res.status(500).send("Error: " + err.message); }
});

app.get("/api/version", (req, res) => res.json({ version: "BACKEND-FOLDER-FIX", status: "READY" }));

// ✅ 2. STANDARD ROUTES
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/settings",   require("./routes/settingsRoutes"));
app.use("/api/inquiries",  require("./routes/inquiryRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 3. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 OLD SERVER PATH (BACKEND/SERVER.JS) IS NOW FIXED ON ${PORT}`));