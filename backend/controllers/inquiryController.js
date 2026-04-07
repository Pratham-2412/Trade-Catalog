const Inquiry = require("../models/Inquiry");
const Product = require("../models/Product");

// ── Create Inquiry (public) ──
const createInquiry = async (req, res) => {
  try {
    const {
      name, email, phone, company,
      country, message, quantity, unit,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        error: "Name, email and message are required",
      });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const inquiry = await Inquiry.create({
      product:     product._id,
      productName: product.name,
      name, email, phone, company,
      country, message, quantity, unit,
      user: req.user?._id || null,
    });

    // ── Increment inquiry count ──
    product.inquiryCount += 1;
    await product.save();

    res.status(201).json({
      message: "Inquiry sent successfully! We will contact you soon.",
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get all inquiries (admin) ──
const getInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip      = (Number(page) - 1) * Number(limit);
    const total     = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .populate("product", "name imageUrl category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      inquiries,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get inquiries for a product (admin) ──
const getProductInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      product: req.params.productId,
    }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Update inquiry status (admin) ──
const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry    = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    inquiry.status = status;
    await inquiry.save();

    res.json({ message: "Inquiry updated", inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Delete inquiry (admin) ──
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    await inquiry.deleteOne();
    res.json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getProductInquiries,
  updateInquiryStatus,
  deleteInquiry,
};