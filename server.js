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

// 🚪 THE DIRECT BYPASS (Standard Navigation)
app.get("/api/auth/force-update", async (req, res) => {
  try {
    const { userId, role } = req.query;
    console.log("⚡ BYPASS HIT:", userId, role);
    await mongoose.model("User").findByIdAndUpdate(userId, { $set: { role } });
    res.send(`<h1>✅ Success! Role changed to ${role}. Redirecting...</h1><script>setTimeout(() => window.location.href='/admin/users', 1000)</script>`);
  } catch (err) { res.status(500).send("Error: " + err.message); }
});

// Atomic Role Update (POST version)
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 INSTANT-START SERVER ON ${PORT}`);
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("🟢 DB CONNECTED"))
    .catch(err => console.error("🔴 DB ERROR:", err));
});
