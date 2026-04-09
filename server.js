const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅ CONNECT DATABASE (Hardcoded)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🟢 DB CONNECTED"))
  .catch(err => console.error("🔴 DB ERROR:", err));

// ✅ USER SCHEMA (Hardcoded for maximum safety)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());

// ☢️ ATOMIC ROLE UPDATE (Hardcoded, No Security, Universal)
app.all("/api/auth/x", async (req, res) => {
  try {
    const { userId, role } = req.body;
    console.log("🎯 ATOMIC HIT:", userId, role);
    const updated = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true });
    res.json({ success: true, user: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Redirect any other variations
app.all("/api/x", (req, res) => res.redirect(307, "/api/auth/x"));

// 🌐 SERVE FRONTEND
const frontendPath = path.join(__dirname, "frontend/dist");
app.use(express.static(frontendPath));

// Standard API Routes (Keep them working)
app.use("/api/auth",       require("./backend/routes/authRoutes"));
app.use("/api/products",   require("./backend/routes/productRoutes"));
app.use("/api/categories", require("./backend/routes/categoryRoutes"));
app.use("/api/settings",   require("./backend/routes/settingsRoutes"));

app.get("*", (req, res) => {
  if (req.url.startsWith("/api")) return res.status(404).json({ error: "API 404" });
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ATOMIC SERVER LIVE ON ${PORT}`));
