const fs      = require("fs");
const path    = require("path");
const csv     = require("csv-parser");
const Product = require("../models/Product");

const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    const csvFilePath = path.join(
      __dirname, "../uploads/csv", req.file.filename
    );
    const results = [];
    const errors  = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end",  resolve)
        .on("error", reject);
    });

    if (results.length === 0) {
      return res.status(400).json({ error: "CSV file is empty or invalid" });
    }

    const productsToInsert = [];

    for (let i = 0; i < results.length; i++) {
      const row    = results[i];
      const rowNum = i + 2;

      // ── Validate required fields ──
      const missing = [];
      if (!row.name?.trim())        missing.push("name");
      if (!row.description?.trim()) missing.push("description");
      if (!row.category?.trim())    missing.push("category");
      if (!row.price?.trim())       missing.push("price");

      if (missing.length > 0) {
        errors.push({
          row: rowNum,
          error: `Missing: ${missing.join(", ")}`,
          data: row,
        });
        continue;
      }

      const price = parseFloat(row.price);
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, error: "Invalid price", data: row });
        continue;
      }

      // ── Parse fields ──
      const tags = row.tags
        ? row.tags.split("|").map((t) => t.trim()).filter(Boolean)
        : [];

      const certifications = row.certifications
        ? row.certifications.split("|").map((c) => c.trim()).filter(Boolean)
        : [];

      // ── Parse specifications ──
      let specifications = [];
      if (row.specifications) {
        try {
          // Format: "key1:value1|key2:value2"
          specifications = row.specifications
            .split("|")
            .map((s) => {
              const [key, ...val] = s.split(":");
              return { key: key.trim(), value: val.join(":").trim() };
            })
            .filter((s) => s.key && s.value);
        } catch {}
      }

      const allowedCurrencies = ["USD", "EUR", "GBP", "INR", "AED", "CNY", "JPY"];
      const currency = row.currency &&
        allowedCurrencies.includes(row.currency.trim().toUpperCase())
        ? row.currency.trim().toUpperCase()
        : "USD";

      const allowedStockStatus = ["in_stock", "out_of_stock", "limited"];
      const stockStatus = row.stockStatus &&
        allowedStockStatus.includes(row.stockStatus.trim())
        ? row.stockStatus.trim()
        : "in_stock";

      // ── Image URL ──
      const imageUrl = row.imageUrl?.trim() || "";

      productsToInsert.push({
        name:             row.name.trim(),
        description:      row.description.trim(),
        shortDescription: row.shortDescription?.trim() || "",
        category:         row.category.trim(),
        price,
        currency,
        unit:             row.unit?.trim()      || "piece",
        priceUnit:        row.priceUnit?.trim() || "",
        minOrderQuantity: parseInt(row.minOrderQuantity) || 1,
        maxOrderQuantity: parseInt(row.maxOrderQuantity) || 0,
        origin:           row.origin?.trim()       || "",
        hsCode:           row.hsCode?.trim()        || "",
        leadTime:         row.leadTime?.trim()      || "",
        paymentTerms:     row.paymentTerms?.trim()  || "",
        certifications,
        stockStatus,
        isFeatured:       row.isFeatured === "true",
        tags,
        specifications,
        imageUrl,
        pdfUrl:           "",
        isBulkUploaded:   true,
      });
    }

    let inserted = [];
    if (productsToInsert.length > 0) {
      inserted = await Product.insertMany(productsToInsert, { ordered: false });
    }

    if (fs.existsSync(csvFilePath)) fs.unlinkSync(csvFilePath);

    res.status(201).json({
      message:   "Bulk upload complete",
      totalRows: results.length,
      inserted:  inserted.length,
      skipped:   errors.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { bulkUploadProducts };