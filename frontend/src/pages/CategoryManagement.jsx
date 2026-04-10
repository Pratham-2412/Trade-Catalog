import { useState, useEffect, useRef } from "react";
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

const PARTICLE_COUNT = 30;

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
    <div className="rounded-xl shadow-lg p-6 relative overflow-hidden"
         style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
      <h3 className="font-bold text-white mb-6 uppercase tracking-wider">
        {category?._id ? "Edit Category" : "Add New Category"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Icon</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="text-3xl w-14 h-14 rounded-xl flex items-center justify-center transition-colors border"
              style={{ background:"rgba(255,255,255,0.04)", borderColor:"rgba(255,255,255,0.1)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor="#3b82f6"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}
            >
              {form.icon}
            </button>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
              Click to choose an icon
            </p>
          </div>

          {showEmoji && (
            <div className="mt-2 p-3 rounded-xl border" style={{ background:"rgba(0,0,0,0.2)", borderColor:"rgba(255,255,255,0.1)" }}>
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, icon: emoji }));
                      setShowEmoji(false);
                    }}
                    className="text-xl w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: form.icon === emoji ? "rgba(59,130,246,0.3)" : "transparent",
                      border: form.icon === emoji ? "1px solid rgba(59,130,246,0.5)" : "1px solid transparent"
                    }}
                    onMouseEnter={e => {if(form.icon!==emoji) e.currentTarget.style.background="rgba(255,255,255,0.05)"}}
                    onMouseLeave={e => {if(form.icon!==emoji) e.currentTarget.style.background="transparent"}}
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
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Category Name *</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. Food & Agriculture"
            className="dark-input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Description</label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev, description: e.target.value,
              }))
            }
            placeholder="Brief description of this category"
            className="dark-input"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all relative overflow-hidden py-3"
            style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}
          >
            <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <FiSave size={15} />
            )}
            {category?._id ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all border"
            style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)", color:"#fff" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
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
  const particleRef = useRef(null);

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

  // ── Particles setup ──
  useEffect(() => {
    const wrap = particleRef.current;
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const d = document.createElement("div");
      d.style.cssText = `
        position:absolute;
        width:4px;height:4px;border-radius:50%;
        background:#34d399;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center py-20 min-h-screen" style={{ background:"#0a1628" }}>
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-trade-navy animate-spin" />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes dotRise {
          0%        { opacity:0; transform:translateY(0); }
          20%       { opacity:0.6; }
          80%       { opacity:0.3; }
          100%      { opacity:0; transform:translateY(-80px); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(32px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        @keyframes btnShimmer {
          0%,100% { transform:translateX(-100%); }
          60%     { transform:translateX(100%); }
        }
        .dark-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .dark-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
        }
        .dark-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated Orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#10b981", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-bold text-3xl text-white tracking-tight" style={{ fontFamily:"Poppins,sans-serif" }}>
                Categories
              </h1>
              <p className="mt-1 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>
                Manage product categories for your catalog
              </p>
            </div>
            <button
              onClick={() => {
                setEditCat(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border"
              style={{
                background: showForm ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                borderColor: showForm ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)",
                color: showForm ? "#f87171" : "#60a5fa"
              }}
              onMouseEnter={e => e.currentTarget.style.background=showForm?"rgba(239,68,68,0.2)":"rgba(59,130,246,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background=showForm?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)"}
            >
              {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
              {showForm ? "CANCEL ALL" : "ADD CATEGORY"}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-8" style={{ animation:"cardIn 0.4s both" }}>
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
                label: "TOTAL CATEGORIES",
                value: categories.length,
                bg: "rgba(59,130,246,0.15)", color: "#60a5fa", border:"rgba(59,130,246,0.3)"
              },
              {
                label: "DEFAULT",
                value: categories.filter((c) => c.isDefault).length,
                bg: "rgba(168,85,247,0.15)", color: "#c084fc", border:"rgba(168,85,247,0.3)"
              },
              {
                label: "CUSTOM",
                value: categories.filter((c) => !c.isDefault).length,
                bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border:"rgba(245,158,11,0.3)"
              },
            ].map((s) => (
              <div key={s.label}
                className="rounded-xl shadow-sm p-4 text-center"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                <p className="text-2xl font-bold rounded-lg py-1 mb-1"
                   style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color:"rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div key={cat._id}
                className="rounded-xl shadow-sm p-5 transition-all"
                style={{
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)",
                  animation:`cardIn 0.5s both ${idx * 0.05}s`
                }}
                onMouseEnter={e => {e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                onMouseLeave={e => {e.currentTarget.style.transform="none"; e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl border"
                         style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)" }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {cat.name}
                      </h3>
                      {cat.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase mt-1 inline-block"
                              style={{ background:"rgba(168,85,247,0.15)", color:"#c084fc", border:"1px solid rgba(168,85,247,0.3)" }}>
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 rounded-lg transition-colors border"
                      style={{ color:"#f59e0b", borderColor:"transparent" }}
                      onMouseEnter={e => {e.currentTarget.style.background="rgba(245,158,11,0.1)"; e.currentTarget.style.borderColor="rgba(245,158,11,0.2)";}}
                      onMouseLeave={e => {e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent";}}
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => handleDelete(cat._id)}
                        disabled={deleting === cat._id}
                        className="p-1.5 rounded-lg transition-colors border disabled:opacity-50"
                        style={{ color:"#f87171", borderColor:"transparent" }}
                        onMouseEnter={e => {e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.2)";}}
                        onMouseLeave={e => {e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent";}}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {cat.description && (
                  <p className="text-xs mb-3 line-clamp-2 font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>
                    {cat.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 mt-auto border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                    <FiPackage size={10} style={{ color:"#60a5fa" }} />
                    {cat.productCount} products
                  </div>
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider truncate ml-2" style={{ color:"rgba(255,255,255,0.4)" }}>
                    <FiTag size={10} style={{ color:"#34d399" }} />
                    {cat.slug}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-16 rounded-xl border flex flex-col items-center justify-center p-6"
                 style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.05)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background:"rgba(255,255,255,0.05)" }}>
                 <FiTag className="text-3xl" style={{ color:"rgba(255,255,255,0.3)" }} />
              </div>
              <p className="font-bold tracking-wider uppercase mb-4" style={{ color:"rgba(255,255,255,0.5)" }}>
                No categories yet
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="py-2.5 px-6 rounded-xl font-bold transition-all relative overflow-hidden"
                style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                ADD FIRST CATEGORY
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryManagement;