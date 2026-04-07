const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ── Generate Token ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ── Format user response ──
const userResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  token,
});

// ── Validate Email ──
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// ── Validate Password ──
const isValidPassword = (password) => {
  const errors = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least 1 lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least 1 number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least 1 special character (!@#$%^&*)");
  }
  if (/\s/.test(password)) errors.push("No spaces allowed");

  return errors;
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Check all fields ──
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ── Validate name ──
    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    // ── Validate email ──
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // ── Validate password ──
    const passwordErrors = isValidPassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        errors: passwordErrors,
      });
    }

    // ── Check if email exists ──
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // ── First user becomes admin ──
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      ...userResponse(user, token),
      message:
        role === "admin"
          ? "Admin account created! You are the first user."
          : "Account created successfully!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Check fields ──
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── Validate email format ──
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    // ── Find user ──
    const user = await User.findOne({ email: cleanEmail }).select(
      "+password +loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ── Check if account is deactivated ──
    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account has been deactivated. Contact admin.",
      });
    }

    // ── Check if account is locked ──
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);

      return res.status(423).json({
        error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
        lockUntil: user.lockUntil,
        minutesLeft,
      });
    }

    // ── Check password ──
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      // Re-fetch updated values
      const updatedUser = await User.findById(user._id).select(
        "+loginAttempts +lockUntil"
      );

      const attemptsLeft = Math.max(0, 5 - updatedUser.loginAttempts);

      if (updatedUser.isLocked || attemptsLeft === 0) {
        return res.status(423).json({
          error: "Account locked for 15 minutes due to too many failed attempts.",
          lockUntil: updatedUser.lockUntil,
        });
      }

      return res.status(401).json({
        error: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} remaining.`,
        attemptsLeft,
      });
    }

    // ── Success — reset attempts ──
    await user.resetLoginAttempts();
    const token = generateToken(user._id);

    res.json({
      ...userResponse(user, token),
      message: "Login successful!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(userResponse(user, null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("+loginAttempts +lockUntil")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const allowedRoles = ["user", "manager", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Unlock User Account ──────────────────────────────────────────────────────
const unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "+loginAttempts +lockUntil"
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    await user.resetLoginAttempts();
    res.json({ message: "Account unlocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUsers,
  updateUserRole,
  unlockUser,
  deleteUser,
};