const HSNCode = require("../models/HSNCode");

// ── Get all HSN codes ──
exports.getHSNCodes = async (req, res) => {
  try {
    const codes = await HSNCode.find().sort({ code: 1 });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Create HSN code ──
exports.createHSNCode = async (req, res) => {
  try {
    const { code, description, gstRate } = req.body;
    const existing = await HSNCode.findOne({ code });
    if (existing) return res.status(400).json({ error: "HSN Code already exists" });

    const hsn = await HSNCode.create({ code, description, gstRate });
    res.status(201).json(hsn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Update HSN code ──
exports.updateHSNCode = async (req, res) => {
  try {
    const hsn = await HSNCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hsn) return res.status(404).json({ error: "HSN Code not found" });
    res.json(hsn);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Delete HSN code ──
exports.deleteHSNCode = async (req, res) => {
  try {
    const hsn = await HSNCode.findByIdAndDelete(req.params.id);
    if (!hsn) return res.status(404).json({ error: "HSN Code not found" });
    res.json({ message: "HSN Code deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
