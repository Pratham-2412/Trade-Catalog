import { useState, useEffect } from "react";
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
  const [activeTab,    setActiveTab]    = useState("basic");

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
    <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 rounded-full border-4 border-blue-200
                      border-t-trade-navy animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-trade-navy">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit
            ? "Update product information"
            : "Fill in the details to add a new product to catalog"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto
                      scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap
                        border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-trade-navy text-trade-navy"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── BASIC INFO TAB ── */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-6 space-y-4">
            <h2 className="font-display font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            {/* Featured Toggle */}
            <label className="flex items-center gap-3 p-3 bg-amber-50
                              rounded-xl cursor-pointer border border-amber-100">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-amber-500"
              />
              <div className="flex items-center gap-2">
                <FiStar className="text-trade-gold" />
                <span className="font-medium text-gray-700 text-sm">
                  Mark as Featured Product
                </span>
              </div>
            </label>

            <div>
              <label className="label">Product Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Basmati Rice Premium Grade"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Short Description</label>
              <input
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="One line summary (shown on cards)"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Full Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Detailed product description..."
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="input-field"
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
                <label className="label">Stock Status</label>
                <select
                  name="stockStatus"
                  value={form.stockStatus}
                  onChange={handleChange}
                  className="input-field"
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
              <label className="label">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="rice, organic, basmati (comma separated)"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* ── TRADE INFO TAB ── */}
        {activeTab === "trade" && (
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-6 space-y-4">
            <h2 className="font-display font-semibold text-gray-900 mb-4">
              Pricing & Trade Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Price *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="input-field"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Unit</label>
                <input
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="kg, piece, liter"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Min Order Quantity</label>
                <input
                  name="minOrderQuantity"
                  type="number"
                  value={form.minOrderQuantity}
                  onChange={handleChange}
                  min="1"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Max Order Quantity
                  <span className="text-gray-400 font-normal ml-1">
                    (0 = unlimited)
                  </span>
                </label>
                <input
                  name="maxOrderQuantity"
                  type="number"
                  value={form.maxOrderQuantity}
                  onChange={handleChange}
                  min="0"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Country of Origin</label>
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="India"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">HS Code</label>
                <input
                  name="hsCode"
                  value={form.hsCode}
                  onChange={handleChange}
                  placeholder="1006.30"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Lead Time</label>
                <input
                  name="leadTime"
                  value={form.leadTime}
                  onChange={handleChange}
                  placeholder="7-10 days"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Payment Terms</label>
                <select
                  name="paymentTerms"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select payment terms</option>
                  {PAYMENT_TERMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Certifications</label>
              <input
                name="certifications"
                value={form.certifications}
                onChange={handleChange}
                placeholder="ISO 9001, FSSAI, Organic (comma separated)"
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* ── SPECIFICATIONS TAB ── */}
        {activeTab === "specs" && (
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-gray-900">
                Specifications
              </h2>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1.5 text-sm text-trade-navy
                           font-medium hover:text-blue-800 transition-colors"
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
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      value={spec.value}
                      onChange={(e) => updateSpec(i, "value", e.target.value)}
                      placeholder="Value (e.g. White)"
                      className="input-field text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="mt-2.5 p-1.5 text-red-400 hover:text-red-600
                               hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              💡 Examples: Moisture: 14% max | Grade: Premium |
              Purity: 99.5% | Color: Golden Yellow
            </p>
          </div>
        )}

        {/* ── MEDIA TAB ── */}
        {activeTab === "media" && (
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-6 space-y-6">
            <h2 className="font-display font-semibold text-gray-900">
              Media Files
            </h2>

            {/* ── Image Section ── */}
            <div>
              <label className="label">Product Image</label>

              {/* Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setUseImageUrl(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5
                              rounded-lg text-sm font-medium transition-all ${
                    !useImageUrl
                      ? "bg-trade-navy text-white"
                      : "border border-gray-200 text-gray-600"
                  }`}
                >
                  <FiUpload size={13} />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUseImageUrl(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5
                              rounded-lg text-sm font-medium transition-all ${
                    useImageUrl
                      ? "bg-trade-navy text-white"
                      : "border border-gray-200 text-gray-600"
                  }`}
                >
                  <FiLink size={13} />
                  Image URL
                </button>
              </div>

              {/* Upload File */}
              {!useImageUrl && (
                <div
                  onClick={() =>
                    document.getElementById("imageInput").click()
                  }
                  className="border-2 border-dashed border-gray-200
                             rounded-xl p-6 cursor-pointer
                             hover:border-trade-navy transition-colors
                             flex flex-col items-center justify-center
                             min-h-[160px]"
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
                        className="absolute -top-2 -right-2 bg-red-500
                                   text-white rounded-full p-1"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="text-gray-300 text-3xl mb-2" />
                      <p className="text-sm text-gray-400 text-center">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
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
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleImageUrl}
                      className="px-4 py-2 bg-trade-navy text-white
                                 rounded-lg text-sm font-medium
                                 hover:bg-blue-800 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-xl
                                   border border-gray-200"
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
                        className="absolute -top-2 -right-2 bg-red-500
                                   text-white rounded-full p-1"
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
            <div>
              <label className="label">
                Product PDF
                <span className="text-gray-400 font-normal ml-1">
                  (auto-generated if not uploaded)
                </span>
              </label>
              <div
                onClick={() =>
                  document.getElementById("pdfInput").click()
                }
                className="border-2 border-dashed border-gray-200
                           rounded-xl p-6 cursor-pointer
                           hover:border-trade-navy transition-colors
                           flex flex-col items-center justify-center
                           min-h-[120px]"
              >
                {pdfFile ? (
                  <div className="text-center">
                    <div className="bg-red-50 text-red-600 rounded-lg
                                    p-3 mb-2 text-sm">
                      📄 {pdfFile.name}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <FiPackage className="text-gray-300 text-3xl mb-2" />
                    <p className="text-sm text-gray-400 text-center">
                      Click to upload PDF catalog
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
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
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex gap-3">
          {activeTab !== "basic" && (
            <button
              type="button"
              onClick={() => {
                const tabs  = ["basic","trade","specs","media"];
                const idx   = tabs.indexOf(activeTab);
                setActiveTab(tabs[idx - 1]);
              }}
              className="px-6 py-3 rounded-xl border-2 border-gray-200
                         text-gray-600 font-medium hover:border-gray-400
                         transition-colors"
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
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700
                         font-medium hover:bg-gray-200 transition-colors"
            >
              Next →
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl border-2 border-gray-200
                       text-gray-600 font-medium hover:border-gray-400
                       transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-trade-navy text-white
                       font-medium hover:bg-blue-800 transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 rounded-full border-2
                                border-white/30 border-t-white animate-spin" />
                {isEdit ? "Updating..." : "Adding..."}
              </>
            ) : (
              isEdit ? "Update Product" : "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;