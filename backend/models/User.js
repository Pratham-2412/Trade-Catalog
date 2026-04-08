const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    password: {
      type:     String,
      required: true,
      select:   false,
    },
    role: {
      type:    String,
      enum:    ["user", "manager", "admin"],
      default: "user",
    },
    isActive: {
      type:    Boolean,
      default: true,
    },

    // ── Login attempt tracking ──
    loginAttempts: {
      type:    Number,
      default: 0,
      select:  false,
    },
    lockUntil: {
      type:   Number,
      select: false,
    },

    // ── Password reset ──
    resetPasswordToken: {
      type:   String,
      select: false,
    },
    resetPasswordExpire: {
      type:   Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Check if account is locked ──
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Hash password before save ──
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Compare password ──
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// ── Increment failed login attempts ──
userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil     = undefined;
    await this.save();
    return;
  }
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5 && !this.isLocked) {
    this.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  await this.save();
};

// ── Reset login attempts ──
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil     = undefined;
  await this.save();
};

module.exports = mongoose.models.User ||
  mongoose.model("User", userSchema);