const crypto = require("crypto");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const sendMail = require("../config/nodemailer");

// ── Generate JWT ──
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// ── Format user response ──
const userResponse = (user, token) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  isActive:  user.isActive,
  createdAt: user.createdAt,
  token,
});

// ── Email validator ──
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// ── Password validator ──
const isValidPassword = (password) => {
  const errors = [];
  if (password.length < 8)
    errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password))
    errors.push("At least 1 uppercase letter");
  if (!/[a-z]/.test(password))
    errors.push("At least 1 lowercase letter");
  if (!/[0-9]/.test(password))
    errors.push("At least 1 number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("At least 1 special character");
  if (/\s/.test(password))
    errors.push("No spaces allowed");
  return errors;
};

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const passwordErrors = isValidPassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error:  "Password does not meet requirements",
        errors: passwordErrors,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // First user = admin
    const userCount = await User.countDocuments();
    const role      = userCount === 0 ? "admin" : "user";

    const user  = await User.create({ name: name.trim(), email, password, role });
    const token = generateToken(user._id);

    // ── Send welcome email ──
    try {
      await sendMail({
        to:      user.email,
        subject: "Welcome to TradeCatalog! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a3c5e; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">TradeCatalog</h1>
              <p style="color: #93c5fd; margin: 5px 0 0;">Import · Export · Trade</p>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1a3c5e;">Welcome, ${user.name}! 👋</h2>
              <p style="color: #555;">Your account has been created successfully.</p>
              <p style="color: #555;">Role: <strong>${role}</strong></p>
              <a href="${process.env.CLIENT_URL || req.headers?.origin || 'https://trade-catalog.vercel.app'}"
                style="display: inline-block; background: #f59e0b; color: white;
                       padding: 12px 30px; border-radius: 8px; text-decoration: none;
                       font-weight: bold; margin-top: 15px;">
                Visit TradeCatalog
              </a>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} TradeCatalog. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError.message);
    }

    res.status(201).json({
      ...userResponse(user, token),
      message: role === "admin"
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

    if (!email?.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Your account has been deactivated. Contact admin.",
      });
    }

    if (user.isLocked) {
      const minutesLeft = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
        lockUntil:   user.lockUntil,
        minutesLeft,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const attemptsLeft = 5 - user.loginAttempts;

      if (attemptsLeft <= 0) {
        return res.status(423).json({
          error:     "Account locked for 15 minutes.",
          lockUntil: user.lockUntil,
        });
      }

      return res.status(401).json({
        error: `Invalid email or password. ${attemptsLeft} attempt(s) remaining.`,
        attemptsLeft,
      });
    }

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

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Please provide your email address",
      });
    }

    const user    = await User.findOne({ email });
    const message = "If that email exists, a reset link has been sent.";

    if (!user) return res.json({ success: true, message });

    // Generate token
    const rawToken    = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpire  = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || req.headers?.origin || "https://trade-catalog.vercel.app";
    const resetURL = `${clientUrl}/?resetToken=${rawToken}`;

    try {
      await sendMail({
        to:      user.email,
        subject: "Password Reset - TradeCatalog",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a3c5e; padding: 30px; text-align: center;
                        border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">TradeCatalog</h1>
              <p style="color: #93c5fd; margin: 5px 0 0;">Import · Export · Trade</p>
            </div>
            <div style="background: #f8fafc; padding: 30px;
                        border-radius: 0 0 10px 10px;">
              <h2 style="color: #1a3c5e;">Password Reset Request</h2>
              <p style="color: #555;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #555;">
                You requested to reset your password.
                Click the button below to proceed:
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetURL}"
                  style="display: inline-block; background: #1a3c5e;
                         color: white; padding: 14px 35px;
                         border-radius: 8px; text-decoration: none;
                         font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <div style="background: #fef3c7; border: 1px solid #f59e0b;
                          border-radius: 8px; padding: 12px; margin: 15px 0;">
                <p style="color: #92400e; margin: 0; font-size: 13px;">
                  ⏱️ This link expires in <strong>15 minutes</strong>
                </p>
              </div>
              <p style="color: #555; font-size: 13px;">
                If you didn't request this, please ignore this email.
                Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb;
                         margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} TradeCatalog. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      res.json({ success: true, message });
    } catch (emailError) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const passwordErrors = isValidPassword(password || "");
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        error:  "Password does not meet requirements",
        errors: passwordErrors,
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Reset link is invalid or has expired",
      });
    }

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    // ── Send confirmation email ──
    try {
      await sendMail({
        to:      user.email,
        subject: "Password Changed Successfully - TradeCatalog",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;
                      margin: 0 auto;">
            <div style="background: #1a3c5e; padding: 30px; text-align: center;
                        border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">TradeCatalog</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px;
                        border-radius: 0 0 10px 10px;">
              <h2 style="color: #10b981;">✅ Password Changed!</h2>
              <p style="color: #555;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #555;">
                Your password has been successfully changed.
              </p>
              <a href="${process.env.CLIENT_URL || req.headers?.origin || 'https://trade-catalog.vercel.app'}/login"
                style="display: inline-block; background: #1a3c5e;
                       color: white; padding: 12px 30px;
                       border-radius: 8px; text-decoration: none;
                       font-weight: bold; margin-top: 10px;">
                Login Now
              </a>
              <p style="color: #ef4444; font-size: 13px; margin-top: 15px;">
                If you didn't make this change, contact us immediately.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: "Password reset successful!",
      ...userResponse(user, token),
    });
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

// ─── Update User Role & Status ───────────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const targetId = req.params.id;

    // Direct database update to bypass any schema-level validation issues
    const updatedUser = await User.findByIdAndUpdate(
      targetId,
      { $set: { role, isActive } },
      { new: true, runValidators: false }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User successfully updated ✅",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Unlock User ──────────────────────────────────────────────────────────────
const unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("+loginAttempts +lockUntil");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
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
      return res.status(400).json({
        error: "Cannot delete your own account",
      });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
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
  forgotPassword,
  resetPassword,
  getUsers,
  updateUserRole,
  unlockUser,
  deleteUser,
};