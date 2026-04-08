exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Please provide your email address." });

    const user = await User.findOne({ email });

    const genericMsg = "If that email exists, a reset link has been generated.";
    if (!user) return res.json({ success: true, message: genericMsg });

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    // 🔥 RETURN LINK IN RESPONSE (instead of email)
    res.json({
      success: true,
      message: genericMsg,
      resetURL, // 👈 IMPORTANT
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};