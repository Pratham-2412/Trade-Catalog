const Role = require("../models/Role");

// ── Get all roles ──
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Create role ──
exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) return res.status(400).json({ error: "Role name already exists" });

    const role = await Role.create({ name, displayName, description, permissions });
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Update role ──
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ── Delete role ──
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });

    // Prevent deleting core roles
    if (["admin", "manager", "user"].includes(role.name)) {
      return res.status(400).json({ error: "Cannot delete core system roles" });
    }

    await role.deleteOne();
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
