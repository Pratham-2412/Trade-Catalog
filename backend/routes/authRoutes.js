const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");


const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getUsers,
  updateUserRole,
  unlockUser,
  deleteUser,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Register limiter only
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: "Too many accounts created. Try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Routes
router.post("/register", registerLimiter, register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected Routes
router.get("/me", protect, getMe);

// Admin Only Routes
router.get("/users", protect, adminOnly, getUsers);
router.put("/users/:id", protect, adminOnly, updateUserRole);
router.put("/users/:id/unlock", protect, adminOnly, unlockUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;