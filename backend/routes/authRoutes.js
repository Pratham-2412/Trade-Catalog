const express   = require("express");
const router    = express.Router();
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUserRole,
  unlockUser,
  deleteUser,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Rate Limiters ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { error: "Too many login attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      3,
  message:  { error: "Too many accounts created. Try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      3,
  message:  { error: "Too many reset attempts. Try again after 1 hour." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Public Routes ──
router.post("/register",              registerLimiter, register);
router.post("/login",                 loginLimiter,    login);
router.post("/forgot-password",       forgotLimiter,   forgotPassword);
router.post("/reset-password/:token",                  resetPassword);

// ── Protected Routes ──
router.get("/me", protect, getMe);

// ── Admin Only ──
router.get("/users",              protect, adminOnly, getUsers);
router.put("/users/:id",          protect, adminOnly, updateUserRole);
router.put("/users/:id/unlock",   protect, adminOnly, unlockUser);
router.delete("/users/:id",       protect, adminOnly, deleteUser);

module.exports = router;