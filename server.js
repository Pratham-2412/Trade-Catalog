const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅ 1. THE LOUDEST LOGGER (Check Render Logs for this!)
app.use((req, res, next) => {
  console.log(`🚀 [Incoming]: ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// ✅ 2. HYPER-PRIORITY API ROUTES (Must be BEFORE static files)
// Atomic Role Update
app.all("/api/auth/x", async (req, res) => {
  console.log("🎯 ATOMIC ROLE UPDATE HIT!");
  try {
    const { userId, role } = req.body;
    await mongoose.model("User").findByIdAndUpdate(userId, { $set: { role } });
    res.json({ success: true, version: "SUPER-PRIORITY-V1" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/version", (req, res) => res.json({ version: "SUPER-PRIORITY-V1" }));
app.get("/api/ping", (req, res) => res.send("PONG"));

// Standard Routes
app.use("/api/auth",       require("./backend/routes/authRoutes"));
app.use("/api/products",   require("./backend/routes/productRoutes"));
app.use("/api/categories", require("./backend/routes/categoryRoutes"));
app.use("/api/settings",   require("./backend/routes/settingsRoutes"));

// ✅ 3. SERVE FRONTEND (Last Priority)
const frontendPath = path.join(__dirname, "frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (req.url.startsWith("/api")) return res.status(404).json({ error: "API NOT FOUND" });
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ 4. DATABASE & START
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("🟢 DB CONNECTED");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 SUPER-PRIORITY SERVER ON ${PORT}`));
  })
  .catch(err => console.error("🔴 DB ERROR:", err));
