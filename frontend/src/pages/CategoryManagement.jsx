import { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiPackage,
  FiSave, FiX, FiTag,
} from "react-icons/fi";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const EMOJI_LIST = [
  "🌾","🧵","⚗️","💻","🔩","🌿","🛢️","🪵",
  "💊","🚗","📦","🌽","🥜","🐟","🌍","🏭",
  "🧪","🔬","🎯","📱","🖥️","⚡","🔧","🏗️",
  "🌊","🌱","🍃","🥦","🫘","🧴","🪨","💎",
];

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name:        category?.name        || "",
    description: category?.description || "",
    icon:        category?.icon        || "📦",
  });
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Category name is required");
    }
    try {
      setLoading(true);
      let data;
      if (category?._id) {
        const res = await API.put(`/categories/${category._id}`, form);
        data = res.data;
        toast.success("Category updated! ✅");
      } else {
        const res = await API.post("/categories", form);
        data = res.data;
        toast.success("Category created! ✅");
      }
      onSave(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100
                    shadow-sm p-6">
      <h3 className="font-display font-semibold text-gray-900 mb-4">
        {category?._id ? "Edit Category" : "Add New Category"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Icon Picker */}
        <div>
          <label className="label">Icon</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="text-3xl w-14 h-14 rounded-xl border-2
                         border-gray-200 flex items-center justify-center
                         hover:border-trade-navy transition-colors"
            >
              {form.icon}
            </button>
            <p className="text-sm text-gray-400">
              Click to choose an icon
            </p>
          </div>

          {showEmoji && (
            <div className="mt-2 p-3 bg-gray-50 rounded-xl border
                            border-gray-200">
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, icon: emoji }));
                      setShowEmoji(false);
                    }}
                    className={`text-xl w-10 h-10 rounded-lg flex
                                items-center justify-center
                                hover:bg-white transition-colors ${
                      form.icon === emoji
                        ? "bg-white shadow-sm border border-gray-200"
                        : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="label">Category Name *</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. Food & Agriculture"
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev, description: e.target.value,
              }))
            }
            placeholder="Brief description of this category"
            className="input-field"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2
                       bg-trade-navy text-white py-2.5 rounded-xl
                       font-medium hover:bg-blue-800 transition-colors
                       disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2
                              border-white/30 border-t-white animate-spin" />
            ) : (
              <FiSave size={15} />
            )}
            {category?._id ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2
                       border-2 border-gray-200 text-gray-600 py-2.5
                       px-5 rounded-xl font-medium hover:border-gray-400
                       transition-colors"
          >
            <FiX size={15} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editCat,    setEditCat]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = (saved) => {
    if (editCat?._id) {
      setCategories((prev) =>
        prev.map((c) => c._id === saved._id ? saved : c)
      );
    } else {
      setCategories((prev) => [...prev, saved]);
    }
    setShowForm(false);
    setEditCat(null);
  };

  const handleEdit = (cat) => {
    setEditCat(cat);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(
      "Delete this category? Products won't be deleted."
    )) return;
    try {
      setDeleting(id);
      await API.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted ✅");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Spinner text="Loading categories..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-trade-navy">
            Categories
          </h1>
          <p className="text-gray-500 mt-1">
            Manage product categories for your catalog
          </p>
        </div>
        <button
          onClick={() => {
            setEditCat(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-trade-navy text-white
                     px-4 py-2.5 rounded-xl text-sm font-medium
                     hover:bg-blue-800 transition-colors"
        >
          {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          <CategoryForm
            category={editCat}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditCat(null);
            }}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Total",
            value: categories.length,
            color: "bg-trade-navy",
          },
          {
            label: "Default",
            value: categories.filter((c) => c.isDefault).length,
            color: "bg-blue-500",
          },
          {
            label: "Custom",
            value: categories.filter((c) => !c.isDefault).length,
            color: "bg-trade-gold",
          },
        ].map((s) => (
          <div key={s.label}
            className="bg-white rounded-xl border border-gray-100
                       shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold text-white ${s.color}
                           rounded-lg py-1 mb-1`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id}
            className="bg-white rounded-xl border border-gray-100
                       shadow-sm p-5 hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-display font-semibold
                                 text-gray-900 text-sm">
                    {cat.name}
                  </h3>
                  {cat.isDefault && (
                    <span className="badge bg-blue-50 text-blue-600
                                     text-xs mt-0.5">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 text-gray-400 hover:text-trade-navy
                             hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit2 size={14} />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => handleDelete(cat._id)}
                    disabled={deleting === cat._id}
                    className="p-1.5 text-gray-400 hover:text-red-500
                               hover:bg-red-50 rounded-lg transition-colors
                               disabled:opacity-50"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {cat.description && (
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {cat.description}
              </p>
            )}

            <div className="flex items-center justify-between
                            pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs
                              text-gray-400">
                <FiPackage size={12} />
                {cat.productCount} products
              </div>
              <div className="flex items-center gap-1 text-xs
                              text-gray-400">
                <FiTag size={12} />
                {cat.slug}
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl
                        border border-gray-100">
          <FiTag className="text-gray-200 text-6xl mx-auto mb-4" />
          <p className="text-gray-400 font-medium">
            No categories yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 btn-primary text-sm"
          >
            Add First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;