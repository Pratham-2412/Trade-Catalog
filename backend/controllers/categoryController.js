const Category = require("../models/Category");
const Product  = require("../models/Product");

// ── Default categories for Import-Export ──
const DEFAULT_CATEGORIES = [
  { name: "Food & Agriculture",    icon: "🌾", isDefault: true },
  { name: "Textiles & Apparel",    icon: "🧵", isDefault: true },
  { name: "Chemicals & Plastics",  icon: "⚗️",  isDefault: true },
  { name: "Electronics & Tech",    icon: "💻", isDefault: true },
  { name: "Metals & Minerals",     icon: "🔩", isDefault: true },
  { name: "Herbs & Spices",        icon: "🌿", isDefault: true },
  { name: "Oils & Lubricants",     icon: "🛢️",  isDefault: true },
  { name: "Wood & Furniture",      icon: "🪵", isDefault: true },
  { name: "Pharmaceuticals",       icon: "💊", isDefault: true },
  { name: "Automotive Parts",      icon: "🚗", isDefault: true },
  { name: "Packaging Materials",   icon: "📦", isDefault: true },
  { name: "Grains & Pulses",       icon: "🌽", isDefault: true },
  { name: "Dry Fruits & Nuts",     icon: "🥜", isDefault: true },
  { name: "Marine Products",       icon: "🐟", isDefault: true },
  { name: "Other",                 icon: "🌍", isDefault: true },
];

// ── Seed default categories ──
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true });
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log("✅ Default categories seeded");
    }
  } catch (error) {
    console.error("❌ Category seeding failed:", error.message);
  }
};

// ── Get all categories with product count ──
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });

    // Add product count for each category
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat.name,
        });
        return { ...cat.toObject(), productCount: count };
      })
    );

    res.json(withCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get single category ──
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Create category (admin) ──
const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (exists) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || "",
      icon: icon || "📦",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Update category (admin) ──
const updateCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (name)        category.name        = name.trim();
    if (description) category.description = description.trim();
    if (icon)        category.icon        = icon;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Delete category (admin) ──
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (category.isDefault) {
      return res.status(400).json({
        error: "Cannot delete default categories",
      });
    }

    const productCount = await Product.countDocuments({
      category: category.name,
    });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete — ${productCount} products use this category`,
      });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  seedCategories,
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};