const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendMail = require("../utils/nodemailer"); // ✅ added

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide name, email and password." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password." });
    }

    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Account is deactivated." });
    }

    if (user.isLocked) {
      const minutesLeft = Math.ceil(
        (user.lockUntil - Date.now()) / 60000
      );
      return res.status(423).json({
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      const remaining = 5 - user.loginAttempts;

      return res.status(401).json({
        error: `Invalid credentials.${
          remaining > 0 ? ` ${remaining} attempt(s) left.` : ""
        }`,
      });
    }

    await user.resetLoginAttempts();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ error: "Please provide your email address." });
    }

    const user = await User.findOne({ email });

    const message = "If that email exists, a reset link has been sent.";

    if (!user) {
      return res.json({ success: true, message });
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    // ✅ Email HTML
    const emailHtml = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password.</p>
      <p>Click the button below:</p>
      
      <a href="${resetURL}" 
        style="
          display:inline-block;
          padding:10px 20px;
          background:#007bff;
          color:#fff;
          text-decoration:none;
          border-radius:5px;
        ">
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>
      <p>If you didn’t request this, ignore this email.</p>
    `;

    try {
      await sendMail({
        to: user.email,
        subject: "Password Reset",
        html: emailHtml,
      });

      res.json({
        success: true,
        message,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        error: "Email could not be sent",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Token is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful.",
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  GET /api/auth/users (admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  PUT /api/auth/users/:id (admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const update = {};
    if (role) update.role = role;
    if (typeof isActive === "boolean") update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  PUT /api/auth/users/:id/unlock (admin)
exports.unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "+loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.resetLoginAttempts();

    res.json({ success: true, message: "User unlocked." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @route  DELETE /api/auth/users/:id (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, message: "User deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};