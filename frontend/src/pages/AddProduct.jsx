import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUpload, FiX, FiPackage, FiPlus,
  FiTrash2, FiStar, FiLink,
} from "react-icons/fi";
import { fetchCategories } from "../api/products";
import API from "../api/axios";
import toast from "react-hot-toast";

const CURRENCIES   = ["USD", "EUR", "GBP", "INR", "AED", "CNY", "JPY"];
const STOCK_STATUS = ["in_stock", "out_of_stock", "limited"];
const PAYMENT_TERMS = ["T/T", "L/C", "D/P", "D/A", "Cash", "PayPal", "Western Union"];
const PARTICLE_COUNT = 30;

const AddProduct = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const editId         = searchParams.get("edit");
  const isEdit         = Boolean(editId);

  const [loading,      setLoading]      = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [categories,   setCategories]   = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile,    setImageFile]    = useState(null);
  const [pdfFile,      setPdfFile]      = useState(null);
  const [imageUrlInput,setImageUrlInput]= useState("");
  const [useImageUrl,  setUseImageUrl]  = useState(false);
  const [hsnCodes,    setHsnCodes]     = useState([]);
  const [activeTab,    setActiveTab]    = useState("basic");
  const particleRef    = useRef(null);

  const [form, setForm] = useState({
    name:             "",
    description:      "",
    shortDescription: "",
    category:         "",
    price:            "",
    currency:         "USD",
    unit:             "piece",
    priceUnit:        "",
    minOrderQuantity: "1",
    maxOrderQuantity: "0",
    origin:           "",
    hsCode:           "",
    leadTime:         "",
    paymentTerms:     "",
    certifications:   "",
    stockStatus:      "in_stock",
    isFeatured:       false,
    tags:             "",
  });

  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  // ── Fetch categories ──
  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data))
      .catch(console.error);

    API.get("/settings/hsn")
      .then(({ data }) => setHsnCodes(data))
      .catch(console.error);
  }, []);

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
        background:#3b82f6;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  // ── Fetch product if editing ──
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const { data } = await API.get(`/products/${editId}`);
        setForm({
          name:             data.name,
          description:      data.description,
          shortDescription: data.shortDescription || "",
          category:         data.category,
          price:            data.price,
          currency:         data.currency,
          unit:             data.unit,
          priceUnit:        data.priceUnit || "",
          minOrderQuantity: data.minOrderQuantity,
          maxOrderQuantity: data.maxOrderQuantity || 0,
          origin:           data.origin   || "",
          hsCode:           data.hsCode   || "",
          leadTime:         data.leadTime || "",
          paymentTerms:     data.paymentTerms || "",
          certifications:   data.certifications?.join(", ") || "",
          stockStatus:      data.stockStatus || "in_stock",
          isFeatured:       data.isFeatured  || false,
          tags:             data.tags?.join(", ") || "",
        });
        if (data.specifications?.length > 0) {
          setSpecifications(data.specifications);
        }
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          if (data.imageUrl.startsWith("http")) {
            setUseImageUrl(true);
            setImageUrlInput(data.imageUrl);
          }
        }
      } catch {
        toast.error("Failed to load product");
        navigate("/");
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [editId, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUseImageUrl(false);
    setImageUrlInput("");
  };

  const handleImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImagePreview(imageUrlInput);
    setUseImageUrl(true);
    setImageFile(null);
  };

  // ── Specifications ──
  const addSpec = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeSpec = (i) => {
    setSpecifications((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateSpec = (i, field, value) => {
    setSpecifications((prev) =>
      prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      // ── Append all form fields ──
      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, v);
      });

      // ── Image ──
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (useImageUrl && imageUrlInput) {
        formData.append("imageUrl", imageUrlInput);
      }

      // ── PDF ──
      if (pdfFile) formData.append("pdf", pdfFile);

      // ── Specifications ──
      const validSpecs = specifications.filter(
        (s) => s.key.trim() && s.value.trim()
      );
      formData.append("specifications", JSON.stringify(validSpecs));

      if (isEdit) {
        await API.put(`/products/${editId}`, formData);
        toast.success("Product updated! ✅");
      } else {
        await API.post("/products", formData);
        toast.success("Product added! ✅");
      }
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "basic",   label: "Basic Info"   },
    { id: "trade",   label: "Trade Info"   },
    { id: "specs",   label: "Specs"        },
    { id: "media",   label: "Media"        },
  ];

  if (fetchLoading) return (
    <div className="flex items-center justify-center py-20 min-h-screen" style={{ background:"#0a1628" }}>
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-trade-navy animate-spin" />
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
        select.dark-input option {
          background: #0f172a;
          color: #fff;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", left:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#f59e0b", filter:"blur(80px)", opacity:0.06, bottom:"10%", right:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
              {isEdit ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="mt-1" style={{ color:"rgba(255,255,255,0.6)" }}>
              {isEdit
                ? "Update product information in your catalog."
                : "Fill in the details below to add a new product to your catalog."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-6 overflow-x-auto scrollbar-hide" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === tab.id ? "#3b82f6" : "transparent",
                  color: activeTab === tab.id ? "#60a5fa" : "rgba(255,255,255,0.5)"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── BASIC INFO TAB ── */}
            <div style={{ display: activeTab === "basic" ? "block" : "none" }}>
              <div className="rounded-xl shadow-sm p-6 space-y-4"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(15px)" }}>
                <h2 className="font-bold text-white mb-4" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Basic Information
                </h2>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all"
                       style={{ background:"rgba(245,158,11,0.05)", borderColor:"rgba(245,158,11,0.2)" }}
                       onMouseEnter={e => e.currentTarget.style.background="rgba(245,158,11,0.1)"}
                       onMouseLeave={e => e.currentTarget.style.background="rgba(245,158,11,0.05)"}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: "#f59e0b" }}
                  />
                  <div className="flex items-center gap-2">
                    <FiStar style={{ color:"#fbbf24" }} />
                    <span className="font-bold text-sm" style={{ color:"rgba(255,255,255,0.9)" }}>
                      Mark as Featured Product
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Product Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Basmati Rice Premium Grade"
                    className="dark-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Short Description</label>
                  <input
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleChange}
                    placeholder="One line summary (shown on cards)"
                    className="dark-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Full Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Detailed product description..."
                    className="dark-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="dark-input"
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Stock Status</label>
                    <select
                      name="stockStatus"
                      value={form.stockStatus}
                      onChange={handleChange}
                      className="dark-input"
                    >
                      {STOCK_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s === "in_stock"     ? "✓ In Stock"     :
                           s === "out_of_stock" ? "✗ Out of Stock" :
                           "⚠ Limited Stock"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Tags</label>
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    placeholder="rice, organic, basmati (comma separated)"
                    className="dark-input"
                  />
                </div>
              </div>
            </div>

            {/* ── TRADE INFO TAB ── */}
            <div style={{ display: activeTab === "trade" ? "block" : "none" }}>
              <div className="rounded-xl shadow-sm p-6 space-y-4"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(15px)" }}>
                <h2 className="font-bold text-white mb-4" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Pricing & Trade Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Price *</label>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="dark-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Currency</label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="dark-input"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Unit</label>
                    <input
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      placeholder="kg, piece, liter"
                      className="dark-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Min Order Quantity</label>
                    <input
                      name="minOrderQuantity"
                      type="number"
                      value={form.minOrderQuantity}
                      onChange={handleChange}
                      min="1"
                      className="dark-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Max Order Quantity
                      <span className="font-medium ml-2 normal-case tracking-normal" style={{ color:"rgba(255,255,255,0.3)" }}>
                        (0 = unlimited)
                      </span>
                    </label>
                    <input
                      name="maxOrderQuantity"
                      type="number"
                      value={form.maxOrderQuantity}
                      onChange={handleChange}
                      min="0"
                      className="dark-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Country of Origin</label>
                    <input
                      name="origin"
                      value={form.origin}
                      onChange={handleChange}
                      placeholder="India"
                      className="dark-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>HS Code</label>
                    <input
                      name="hsCode"
                      list="hsn-list"
                      value={form.hsCode}
                      onChange={handleChange}
                      placeholder="1006.30"
                      className="dark-input"
                    />
                    <datalist id="hsn-list">
                      {hsnCodes.map((hsn) => (
                        <option key={hsn._id} value={hsn.code}>
                          {hsn.code} - {hsn.description}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Lead Time</label>
                    <input
                      name="leadTime"
                      value={form.leadTime}
                      onChange={handleChange}
                      placeholder="7-10 days"
                      className="dark-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Payment Terms</label>
                    <select
                      name="paymentTerms"
                      value={form.paymentTerms}
                      onChange={handleChange}
                      className="dark-input"
                    >
                      <option value="">Select payment terms</option>
                      {PAYMENT_TERMS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>Certifications</label>
                  <input
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    placeholder="ISO 9001, FSSAI, Organic (comma separated)"
                    className="dark-input"
                  />
                </div>
              </div>
            </div>

            {/* ── SPECIFICATIONS TAB ── */}
            <div style={{ display: activeTab === "specs" ? "block" : "none" }}>
              <div className="rounded-xl shadow-sm p-6"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(15px)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white mb-4" style={{ fontFamily:"Poppins,sans-serif" }}>
                    Specifications
                  </h2>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FiPlus size={16} />
                    Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {specifications.map((spec, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          value={spec.key}
                          onChange={(e) => updateSpec(i, "key", e.target.value)}
                          placeholder="Property (e.g. Color)"
                          className="dark-input"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          value={spec.value}
                          onChange={(e) => updateSpec(i, "value", e.target.value)}
                          placeholder="Value (e.g. White)"
                          className="dark-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="mt-2.5 p-2 text-red-500 hover:text-white rounded-lg transition-colors border border-transparent hover:bg-red-500 hover:border-red-400"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-xs mt-4" style={{ color:"rgba(255,255,255,0.4)" }}>
                  💡 Examples: Moisture: 14% max | Grade: Premium | Purity: 99.5% | Color: Golden Yellow
                </p>
              </div>
            </div>

            {/* ── MEDIA TAB ── */}
            <div style={{ display: activeTab === "media" ? "block" : "none" }}>
              <div className="rounded-xl shadow-sm p-6 space-y-6"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(15px)" }}>
                <h2 className="font-bold text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Media Files
                </h2>

                {/* ── Image Section ── */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-4" style={{ color:"rgba(255,255,255,0.5)" }}>Product Image</label>

                  {/* Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUseImageUrl(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: !useImageUrl ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "rgba(255,255,255,0.05)",
                        color: "#fff",
                        border: !useImageUrl ? "1px solid transparent" : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: !useImageUrl ? "0 4px 15px rgba(59,130,246,0.3)" : "none"
                      }}
                    >
                      <FiUpload size={13} />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseImageUrl(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: useImageUrl ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "rgba(255,255,255,0.05)",
                        color: "#fff",
                        border: useImageUrl ? "1px solid transparent" : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: useImageUrl ? "0 4px 15px rgba(59,130,246,0.3)" : "none"
                      }}
                    >
                      <FiLink size={13} />
                      Image URL
                    </button>
                  </div>

                  {/* Upload File */}
                  {!useImageUrl && (
                    <div
                      onClick={() => document.getElementById("imageInput").click()}
                      className="border-2 border-dashed rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center min-h-[160px] transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.2)", background:"rgba(0,0,0,0.2)" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                    >
                      {imagePreview && !imagePreview.startsWith("http") ? (
                        <div className="relative w-full">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                              setImageFile(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border border-white"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-3xl mb-2" style={{ color:"rgba(255,255,255,0.3)" }} />
                          <p className="text-sm font-bold" style={{ color:"rgba(255,255,255,0.6)" }}>
                            Click to upload image
                          </p>
                          <p className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                            JPEG, PNG, WEBP up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Image URL */}
                  {useImageUrl && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/product-image.jpg"
                          className="dark-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleImageUrl}
                          className="px-4 py-2 font-bold text-white rounded-lg transition-colors border"
                          style={{ background:"rgba(59,130,246,0.2)", borderColor:"rgba(59,130,246,0.5)" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.4)"}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(59,130,246,0.2)"}
                        >
                          Preview
                        </button>
                      </div>
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="w-full h-40 object-cover rounded-xl border"
                            style={{ borderColor:"rgba(255,255,255,0.1)" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              toast.error("Invalid image URL");
                              setImagePreview(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageUrlInput("");
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border border-white"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </div>

                {/* ── PDF Section ── */}
                <div className="mt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-4" style={{ color:"rgba(255,255,255,0.5)" }}>
                    Product PDF
                    <span className="font-medium ml-2 normal-case tracking-normal" style={{ color:"rgba(255,255,255,0.3)" }}>
                      (auto-generated if not uploaded)
                    </span>
                  </label>
                  <div
                    onClick={() => document.getElementById("pdfInput").click()}
                    className="border-2 border-dashed rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center min-h-[120px] transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.2)", background:"rgba(0,0,0,0.2)" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#f59e0b"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}
                  >
                    {pdfFile ? (
                      <div className="text-center">
                        <div className="rounded-lg p-3 mb-2 text-sm font-bold"
                             style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.3)" }}>
                          📄 {pdfFile.name}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPdfFile(null);
                          }}
                          className="text-xs font-bold text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <FiPackage className="text-3xl mb-2" style={{ color:"rgba(255,255,255,0.3)" }} />
                        <p className="text-sm font-bold" style={{ color:"rgba(255,255,255,0.6)" }}>
                          Click to upload PDF catalog
                        </p>
                        <p className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                          PDF only · Max 10MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="pdfInput"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* ── Navigation Buttons ── */}
            <div className="flex gap-3 pt-4">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs  = ["basic","trade","specs","media"];
                    const idx   = tabs.indexOf(activeTab);
                    setActiveTab(tabs[idx - 1]);
                  }}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                >
                  ← Previous
                </button>
              )}

              {activeTab !== "media" ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ["basic","trade","specs","media"];
                    const idx  = tabs.indexOf(activeTab);
                    setActiveTab(tabs[idx + 1]);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold transition-all relative overflow-hidden"
                  style={{ background:"linear-gradient(135deg,#e2e8f0,#cbd5e1)", color:"#0f172a", boxShadow:"0 4px 15px rgba(255,255,255,0.1)" }}
                >
                  Next →
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-xl font-bold transition-colors"
                style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", color:"#fff" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}
              >
                <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                {loading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {isEdit ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEdit ? "Update Product" : "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;