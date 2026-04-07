const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Ensure upload directories exist ────────────────────────────────────────
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDir(path.join(__dirname, "../uploads/images"));
ensureDir(path.join(__dirname, "../uploads/pdfs"));
ensureDir(path.join(__dirname, "../uploads/csv"));

// ─── Storage Engine ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, path.join(__dirname, "../uploads/images"));
    } else if (file.mimetype === "application/pdf") {
      cb(null, path.join(__dirname, "../uploads/pdfs"));
    } else if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, path.join(__dirname, "../uploads/csv"));
    } else {
      cb(new Error("Unsupported file type"), null);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// ─── File Filter ─────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedPdfType = "application/pdf";
  const allowedCsvTypes = [
    "text/csv",
    "application/vnd.ms-excel",
  ];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    file.mimetype === allowedPdfType ||
    allowedCsvTypes.includes(file.mimetype) ||
    file.originalname.endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, WEBP), PDFs, and CSVs are allowed.`
      ),
      false
    );
  }
};

// ─── Multer Instances ─────────────────────────────────────────────────────────

// For adding a single product (image + optional PDF)
const uploadProduct = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
}).fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

// For bulk CSV upload
const uploadCSV = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single("csv");

// ─── Error Wrapper Middleware ─────────────────────────────────────────────────
// Wraps multer to catch its errors and forward to Express error handler
const handleUploadProduct = (req, res, next) => {
  uploadProduct(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const handleUploadCSV = (req, res, next) => {
  uploadCSV(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = { handleUploadProduct, handleUploadCSV };
