const Razorpay   = require("razorpay");
const crypto     = require("crypto");
const PDFDocument = require("pdfkit");
const fs         = require("fs");
const path       = require("path");
const Order      = require("../models/Order");
const Product    = require("../models/Product");

// ── Razorpay instance ──
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Currency conversion helper (INR base) ──
const convertToINR = (price, currency) => {
  const rates = {
    INR: 1,
    USD: 83,
    EUR: 90,
    GBP: 105,
    AED: 22.6,
    CNY: 11.5,
    JPY: 0.55,
  };
  return Math.round(price * (rates[currency] || 83));
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────
// @route POST /api/orders/create
// @access Private
const createOrder = async (req, res) => {
  try {
    const {
      productId, quantity,
      shippingAddress, notes,
    } = req.body;

    if (!productId || !quantity || !shippingAddress) {
      return res.status(400).json({
        error: "Product, quantity and shipping address are required",
      });
    }

    // ── Get product ──
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stockStatus === "out_of_stock") {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    if (quantity < product.minOrderQuantity) {
      return res.status(400).json({
        error: `Minimum order quantity is ${product.minOrderQuantity} ${product.unit}`,
      });
    }

    // ── Calculate amounts ──
    const priceINR    = convertToINR(product.price, product.currency);
    const subtotal    = priceINR * quantity;
    const tax         = Math.round(subtotal * 0.18); // 18% GST
    const shipping    = subtotal > 50000 ? 0 : 500;  // Free above ₹50k
    const totalAmount = subtotal + tax + shipping;

    // ── Create Razorpay order ──
    const razorpayOrder = await razorpay.orders.create({
      amount:   totalAmount * 100, // paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes: {
        productName: product.name,
        userId:      req.user._id.toString(),
        quantity:    quantity.toString(),
      },
    });

    // ── Save order in DB ──
    const order = await Order.create({
      user:    req.user._id,
      items:   [{
        product:      product._id,
        productName:  product.name,
        productImage: product.imageUrl,
        category:     product.category,
        price:        priceINR,
        currency:     "INR",
        quantity,
        unit:         product.unit,
        totalPrice:   priceINR * quantity,
      }],
      shippingAddress,
      subtotal,
      tax,
      shippingCost:      shipping,
      totalAmount,
      currency:          "INR",
      razorpayOrderId:   razorpayOrder.id,
      paymentStatus:     "pending",
      orderStatus:       "pending",
      notes:             notes || "",
    });

    res.status(201).json({
      order,
      razorpayOrder,
      key:    process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
      currency: "INR",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
// @route POST /api/orders/verify
// @access Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // ── Verify signature ──
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "failed",
      });
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // ── Update order ──
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus:     "paid",
        orderStatus:       "confirmed",
        paidAt:            new Date(),
      },
      { new: true }
    ).populate("user", "name email");

    res.json({
      success: true,
      message: "Payment verified successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
// @route GET /api/orders/my-orders
// @access Private
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ user: req.user._id });

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────
// @route GET /api/orders/:id
// @access Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only owner or admin can view
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
// @route GET /api/orders
// @access Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      status, paymentStatus,
    } = req.query;

    const query = {};
    if (status)        query.orderStatus   = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip   = (Number(page) - 1) * Number(limit);
    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
// @route PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, adminNotes, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "shipped")   order.shippedAt   = new Date();
      if (orderStatus === "delivered") order.deliveredAt = new Date();
      if (orderStatus === "cancelled") order.cancelledAt = new Date();
    }

    if (adminNotes)     order.adminNotes     = adminNotes;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();
    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Generate Invoice PDF ─────────────────────────────────────────────────────
// @route GET /api/orders/:id/invoice
// @access Private
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Invoice_${order.orderNumber}.pdf"`
    );
    doc.pipe(res);

    // ── Header ──
    doc.fontSize(28).fillColor("#1a3c5e")
       .text("TradeCatalog", { align: "left" });
    doc.fontSize(10).fillColor("#666")
       .text("Import-Export Product Catalog", { align: "left" })
       .moveDown(0.5);

    // ── Invoice title ──
    doc.fontSize(20).fillColor("#1a3c5e")
       .text("INVOICE", { align: "right" });
    doc.fontSize(10).fillColor("#666")
       .text(`Order #: ${order.orderNumber}`, { align: "right" })
       .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`,
             { align: "right" })
       .text(`Status: ${order.paymentStatus.toUpperCase()}`,
             { align: "right" });

    doc.moveTo(50, doc.y + 10).lineTo(560, doc.y + 10)
       .strokeColor("#1a3c5e").lineWidth(2).stroke().moveDown(1.5);

    // ── Bill To ──
    doc.fontSize(12).fillColor("#1a3c5e").text("Bill To:");
    doc.fontSize(10).fillColor("#333")
       .text(order.shippingAddress.fullName)
       .text(order.shippingAddress.company || "")
       .text(order.shippingAddress.address)
       .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`)
       .text(`${order.shippingAddress.country} - ${order.shippingAddress.pincode}`)
       .text(`Phone: ${order.shippingAddress.phone}`)
       .text(`Email: ${order.shippingAddress.email}`)
       .moveDown(1);

    // ── Items Table ──
    doc.moveTo(50, doc.y).lineTo(560, doc.y)
       .strokeColor("#ddd").lineWidth(1).stroke();

    doc.fontSize(10).fillColor("#fff")
       .rect(50, doc.y, 510, 25).fill("#1a3c5e");

    const tableTop = doc.y - 20;
    doc.fillColor("#fff")
       .text("Product",    60,  tableTop + 7)
       .text("Qty",        340, tableTop + 7)
       .text("Unit Price", 380, tableTop + 7)
       .text("Total",      480, tableTop + 7);

    doc.moveDown(0.5);

    order.items.forEach((item, i) => {
      const y = doc.y;
      if (i % 2 === 0) {
        doc.rect(50, y - 5, 510, 25).fill("#f8fafc");
      }
      doc.fillColor("#333")
         .text(item.productName,                     60,  y)
         .text(String(item.quantity),                340, y)
         .text(`₹${item.price.toLocaleString()}`,    380, y)
         .text(`₹${item.totalPrice.toLocaleString()}`,480, y);
      doc.moveDown(0.8);
    });

    doc.moveTo(50, doc.y).lineTo(560, doc.y)
       .strokeColor("#ddd").lineWidth(1).stroke().moveDown(0.5);

    // ── Totals ──
    const addTotal = (label, value, bold = false) => {
      doc.fontSize(bold ? 12 : 10)
         .fillColor(bold ? "#1a3c5e" : "#333")
         .text(label, 380, doc.y, { width: 90 })
         .text(value, 480, doc.y - (bold ? 14 : 12));
      doc.moveDown(0.5);
    };

    addTotal("Subtotal:",     `₹${order.subtotal.toLocaleString()}`);
    addTotal("GST (18%):",    `₹${order.tax.toLocaleString()}`);
    addTotal("Shipping:",
      order.shippingCost === 0 ? "FREE" :
      `₹${order.shippingCost.toLocaleString()}`);

    doc.moveTo(380, doc.y).lineTo(560, doc.y)
       .strokeColor("#1a3c5e").lineWidth(1).stroke().moveDown(0.3);

    addTotal("TOTAL:",
      `₹${order.totalAmount.toLocaleString()}`, true);

    // ── Payment Info ──
    if (order.razorpayPaymentId) {
      doc.moveDown(1)
         .fontSize(10).fillColor("#666")
         .text(`Payment ID: ${order.razorpayPaymentId}`)
         .text(`Payment Method: Razorpay`);
    }

    // ── Footer ──
    doc.moveDown(3)
       .fontSize(9).fillColor("#aaa")
       .text(
         "Thank you for your business! | TradeCatalog © " +
         new Date().getFullYear(),
         { align: "center" }
       );

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Get Order Stats (Admin) ──────────────────────────────────────────────────
// @route GET /api/orders/stats
// @access Admin
const getOrderStats = async (req, res) => {
  try {
    const total     = await Order.countDocuments();
    const paid      = await Order.countDocuments({ paymentStatus: "paid" });
    const pending   = await Order.countDocuments({ paymentStatus: "pending" });
    const revenue   = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find({ paymentStatus: "paid" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      paid,
      pending,
      revenue:      revenue[0]?.total || 0,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  generateInvoice,
  getOrderStats,
};