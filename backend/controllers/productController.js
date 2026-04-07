const Product  = require("../models/Product");
const path     = require("path");
const fs       = require("fs");
const PDFDocument = require("pdfkit");

// ── Helper: Build file URLs ──
const getFileUrl = (req, filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  return `${req.protocol}://${req.get("host")}/${filePath.replace(/\\/g, "/")}`;
};

// ── Get all products ──
const getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      currency, origin, stockStatus, isFeatured,
      sortBy = "createdAt", sortOrder = "desc",
      page = 1, limit = 12,
    } = req.query;

    const query = {};

    // ── Search ──
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { tags:        { $in: [new RegExp(search, "i")] } },
        { origin:      { $regex: search, $options: "i" } },
        { hsCode:      { $regex: search, $options: "i" } },
      ];
    }

    // ── Filters ──
    if (category)    query.category    = { $regex: category, $options: "i" };
    if (currency)    query.currency    = currency;
    if (origin)      query.origin      = { $regex: origin, $options: "i" };
    if (stockStatus) query.stockStatus = stockStatus;
    if (isFeatured === "true") query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // ── Sort ──
    const sortOptions = {};
    const validSortFields = ["price", "createdAt", "name", "views", "inquiryCount"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const productsWithUrls = products.map((p) => {
      const obj = p.toObject();
      obj.imageUrl = obj.imageUrl ? getFileUrl(req, obj.imageUrl) : "";
      obj.pdfUrl   = obj.pdfUrl   ? getFileUrl(req, obj.pdfUrl)   : "";
      obj.images   = obj.images.map((img) => getFileUrl(req, img));
      return obj;
    });

    res.json({
      total,
      page:     Number(page),
      pages:    Math.ceil(total / Number(limit)),
      products: productsWithUrls,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get single product ──
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    const obj    = product.toObject();
    obj.imageUrl = obj.imageUrl ? getFileUrl(req, obj.imageUrl) : "";
    obj.pdfUrl   = obj.pdfUrl   ? getFileUrl(req, obj.pdfUrl)   : "";
    obj.images   = obj.images.map((img) => getFileUrl(req, img));

    // ── Related products ──
    const related = await Product.find({
      category: product.category,
      _id:      { $ne: product._id },
    }).limit(4);

    res.json({ ...obj, related });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Create product ──
const createProduct = async (req, res) => {
  try {
    const {
      name, description, shortDescription,
      category, price, currency, unit, priceUnit,
      minOrderQuantity, maxOrderQuantity,
      origin, hsCode, tags, leadTime,
      paymentTerms, certifications,
      stockStatus, isFeatured, specifications,
      imageUrl: bodyImageUrl,
    } = req.body;

    // Image — uploaded file takes priority over URL
    let imageUrl = bodyImageUrl || "";
    if (req.files?.image) {
      imageUrl = `uploads/images/${req.files.image[0].filename}`;
    }

    const pdfUrl = req.files?.pdf
      ? `uploads/pdfs/${req.files.pdf[0].filename}`
      : "";

    const parsedTags = typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : tags || [];

    const parsedCerts = typeof certifications === "string"
      ? certifications.split(",").map((c) => c.trim()).filter(Boolean)
      : certifications || [];

    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
      } catch {}
    }

    const product = await Product.create({
      name, description,
      shortDescription: shortDescription || "",
      category, price, currency,
      unit, priceUnit,
      minOrderQuantity, maxOrderQuantity,
      origin, hsCode, leadTime, paymentTerms,
      certifications: parsedCerts,
      stockStatus:    stockStatus || "in_stock",
      isFeatured:     isFeatured === "true" || isFeatured === true,
      tags:           parsedTags,
      specifications: parsedSpecs,
      imageUrl, pdfUrl,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Update product ──
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const fields = [
      "name", "description", "shortDescription", "category",
      "price", "currency", "unit", "priceUnit",
      "minOrderQuantity", "maxOrderQuantity", "origin",
      "hsCode", "leadTime", "paymentTerms", "stockStatus",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    if (req.body.isFeatured !== undefined) {
      product.isFeatured =
        req.body.isFeatured === "true" || req.body.isFeatured === true;
    }

    if (req.body.tags) {
      product.tags = typeof req.body.tags === "string"
        ? req.body.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : req.body.tags;
    }

    if (req.body.certifications) {
      product.certifications = typeof req.body.certifications === "string"
        ? req.body.certifications.split(",").map((c) => c.trim()).filter(Boolean)
        : req.body.certifications;
    }

    if (req.body.specifications) {
      try {
        product.specifications = typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch {}
    }

    // ── Image update ──
    if (req.files?.image) {
      if (product.imageUrl && !product.imageUrl.startsWith("http")) {
        const oldPath = path.join(__dirname, "../", product.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.imageUrl = `uploads/images/${req.files.image[0].filename}`;
    } else if (req.body.imageUrl) {
      product.imageUrl = req.body.imageUrl;
    }

    // ── PDF update ──
    if (req.files?.pdf) {
      if (product.pdfUrl && !product.pdfUrl.startsWith("http")) {
        const oldPath = path.join(__dirname, "../", product.pdfUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.pdfUrl = `uploads/pdfs/${req.files.pdf[0].filename}`;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Delete product ──
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    ["imageUrl", "pdfUrl"].forEach((field) => {
      if (product[field] && !product[field].startsWith("http")) {
        const filePath = path.join(__dirname, "../", product[field]);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Download or generate PDF ──
const downloadProductPDF = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Serve uploaded PDF
    if (product.pdfUrl && !product.pdfUrl.startsWith("http")) {
      const filePath = path.join(__dirname, "../", product.pdfUrl);
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition",
          `attachment; filename="${product.name.replace(/\s+/g, "_")}_catalog.pdf"`);
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // ── Generate PDF ──
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition",
      `attachment; filename="${product.name.replace(/\s+/g, "_")}_catalog.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor("#1a3c5e")
       .text("TradeCatalog", { align: "center" })
       .fontSize(11).fillColor("#666")
       .text("Import-Export Product Catalog", { align: "center" })
       .moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(560, doc.y)
       .strokeColor("#1a3c5e").lineWidth(2).stroke().moveDown(1);

    // Image
    if (product.imageUrl && !product.imageUrl.startsWith("http")) {
      const imgPath = path.join(__dirname, "../", product.imageUrl);
      if (fs.existsSync(imgPath)) {
        doc.image(imgPath, { fit: [200, 200], align: "center" }).moveDown(1);
      }
    }

    // Product name
    doc.fontSize(20).fillColor("#1a3c5e").text(product.name).moveDown(0.3);
    doc.fontSize(11).fillColor("#555").text(product.description).moveDown(0.8);

    doc.moveTo(50, doc.y).lineTo(560, doc.y)
       .strokeColor("#ddd").lineWidth(1).stroke().moveDown(0.5);

    const addRow = (label, value) => {
      if (!value && value !== 0) return;
      doc.fontSize(11).fillColor("#1a3c5e")
         .text(`${label}: `, { continued: true })
         .fillColor("#333").text(String(value)).moveDown(0.3);
    };

    addRow("Category",          product.category);
    addRow("Price",             `${product.price} ${product.currency} / ${product.unit}`);
    addRow("Min. Order Qty",    `${product.minOrderQuantity} ${product.unit}`);
    addRow("Country of Origin", product.origin);
    addRow("HS Code",           product.hsCode);
    addRow("Lead Time",         product.leadTime);
    addRow("Payment Terms",     product.paymentTerms);
    addRow("Stock Status",      product.stockStatus?.replace("_", " "));

    if (product.certifications?.length > 0) {
      addRow("Certifications", product.certifications.join(", "));
    }

    if (product.specifications?.length > 0) {
      doc.moveDown(0.5)
         .fontSize(13).fillColor("#1a3c5e")
         .text("Specifications").moveDown(0.3);
      product.specifications.forEach((spec) => {
        addRow(spec.key, spec.value);
      });
    }

    if (product.tags?.length > 0) {
      addRow("Tags", product.tags.join(", "));
    }

    // Footer
    doc.moveDown(2).fontSize(9).fillColor("#aaa")
       .text(
         `Generated on ${new Date().toLocaleDateString()} | TradeCatalog © ${new Date().getFullYear()}`,
         { align: "center" }
       );

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadProductPDF,
};