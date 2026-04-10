import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch, FiFilter, FiX, FiPackage,
  FiGrid, FiList, FiChevronDown, FiStar,
  FiTrendingUp, FiArrowUp, FiArrowDown,
} from "react-icons/fi";
import { fetchProducts, fetchCategories } from "../api/products";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const CURRENCIES  = ["USD", "EUR", "GBP", "INR", "AED", "CNY", "JPY"];
const STOCK       = ["in_stock", "out_of_stock", "limited"];
const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest First"     },
  { value: "createdAt:asc",  label: "Oldest First"     },
  { value: "price:asc",      label: "Price: Low → High"},
  { value: "price:desc",     label: "Price: High → Low"},
  { value: "name:asc",       label: "Name: A → Z"      },
  { value: "views:desc",     label: "Most Viewed"       },
];
const PARTICLE_COUNT = 40;

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:     { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    out_of_stock: { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
    limited:      { bg: "rgba(249,115,22,0.15)",  color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  };
  const labels = {
    in_stock:    "In Stock",
    out_of_stock:"Out of Stock",
    limited:     "Limited",
  };
  const theme = styles[status] || styles.in_stock;

  return (
    <span className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider"
          style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}>
      {labels[status]}
    </span>
  );
};

const ProductList = () => {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [viewMode,    setViewMode]    = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);

  // ── Filters ──
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [currency,    setCurrency]    = useState("");
  const [origin,      setOrigin]      = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [isFeatured,  setIsFeatured]  = useState(false);
  const [sortBy,      setSortBy]      = useState("createdAt:desc");
  const [page,        setPage]        = useState(1);
  const particleRef = useRef(null);

  // ── Fetch categories ──
  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data))
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
        width:3px;height:3px;border-radius:50%;
        background:#3b82f6;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 6}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  // ── Fetch products ──
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [sortField, sortOrder] = sortBy.split(":");
      const params = {
        page, limit: 12,
        sortBy: sortField, sortOrder,
      };
      if (search)      params.search      = search;
      if (category)    params.category    = category;
      if (currency)    params.currency    = currency;
      if (origin)      params.origin      = origin;
      if (stockStatus) params.stockStatus = stockStatus;
      if (isFeatured)  params.isFeatured  = true;
      if (minPrice)    params.minPrice    = minPrice;
      if (maxPrice)    params.maxPrice    = maxPrice;

      const { data } = await fetchProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    search, category, currency, origin,
    stockStatus, isFeatured, minPrice,
    maxPrice, sortBy, page,
  ]);

  useEffect(() => {
    const delay = setTimeout(loadProducts, 400);
    return () => clearTimeout(delay);
  }, [loadProducts]);

  const handleReset = () => {
    setSearch(""); setCategory(""); setMinPrice("");
    setMaxPrice(""); setCurrency(""); setOrigin("");
    setStockStatus(""); setIsFeatured(false);
    setSortBy("createdAt:desc"); setPage(1);
  };

  const hasFilters = search || category || minPrice ||
    maxPrice || currency || origin || stockStatus || isFeatured;

  const activeFilterCount = [
    search, category, minPrice, maxPrice,
    currency, origin, stockStatus, isFeatured,
  ].filter(Boolean).length;

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
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", right:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#f59e0b", filter:"blur(80px)", opacity:0.06, bottom:"10%", left:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* ── Hero Section ── */}
          <div className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
               style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.15),rgba(30,64,175,0.3))", border:"1px solid rgba(59,130,246,0.3)", backdropFilter:"blur(20px)" }}>
            <h1 className="font-bold text-3xl md:text-4xl mb-2" style={{ fontFamily:"Poppins,sans-serif" }}>
              Global Trade Catalog
            </h1>
            <p className="mb-6" style={{ color:"rgba(255,255,255,0.7)" }}>
              Discover {total.toLocaleString()} premium import-export products
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{ color:"rgba(255,255,255,0.5)" }} />
              <input
                type="text"
                placeholder="Search products, categories, origins..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm transition-shadow"
                style={{
                  background:"rgba(0,0,0,0.3)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)",
                  boxShadow:"0 4px 20px rgba(0,0,0,0.2)"
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor="#3b82f6";
                  e.currentTarget.style.boxShadow="0 0 15px rgba(59,130,246,0.3)";
                  e.currentTarget.outline="none";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";
                  e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.2)";
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white transition-colors"
                  style={{ color:"rgba(255,255,255,0.5)" }}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ── Category Pills ── */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <button
              onClick={() => { setCategory(""); setPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
              style={{
                background: !category ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "rgba(255,255,255,0.06)",
                color: "#fff",
                border: !category ? "border:none" : "1px solid rgba(255,255,255,0.15)",
                boxShadow: !category ? "0 4px 15px rgba(59,130,246,0.35)" : "none"
              }}
            >
              All Products
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background:"rgba(255,255,255,0.2)" }}>
                {total}
              </span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setCategory(cat.name); setPage(1); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                style={{
                  background: category === cat.name ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  border: category === cat.name ? "border:none" : "1px solid rgba(255,255,255,0.15)",
                  boxShadow: category === cat.name ? "0 4px 15px rgba(59,130,246,0.35)" : "none"
                }}
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: category === cat.name ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)" }}>
                  {cat.productCount}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-6">

            {/* ── Sidebar Filters ── */}
            <div className={`flex-shrink-0 w-64 ${
              showFilters ? "block" : "hidden lg:block"
            }`}>
              <div className="rounded-xl shadow-sm p-5 sticky top-24"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white tracking-wide" style={{ fontFamily:"Poppins,sans-serif" }}>
                    Filters
                  </h3>
                  {hasFilters && (
                    <button
                      onClick={handleReset}
                      className="text-xs font-bold transition-colors"
                      style={{ color:"#f87171" }}
                      onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color="#f87171"}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Featured */}
                <div className="mb-5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        setPage(1);
                      }}
                      className="w-4 h-4"
                      style={{ accentColor: "#3b82f6" }}
                    />
                    <span className="text-sm font-medium flex items-center gap-1" style={{ color:"rgba(255,255,255,0.8)" }}>
                      <FiStar style={{ color:"#f59e0b" }} size={14} />
                      Featured Only
                    </span>
                  </label>
                </div>

                {/* Price Range */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold mb-3" style={{ color:"rgba(255,255,255,0.9)" }}>
                    Price Range
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                      className="w-1/2 p-2 rounded-lg text-sm dark-input"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                      className="w-1/2 p-2 rounded-lg text-sm dark-input"
                    />
                  </div>
                </div>

                {/* Currency */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold mb-3" style={{ color:"rgba(255,255,255,0.9)" }}>
                    Currency
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCurrency(currency === c ? "" : c); setPage(1); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: currency === c ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
                          color: currency === c ? "#60a5fa" : "rgba(255,255,255,0.6)",
                          border: currency === c ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.1)"
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold mb-3" style={{ color:"rgba(255,255,255,0.9)" }}>
                    Stock Status
                  </h4>
                  <div className="space-y-3">
                    {STOCK.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="stockStatus"
                          checked={stockStatus === s}
                          onChange={() => { setStockStatus(s); setPage(1); }}
                          style={{ accentColor: "#3b82f6" }}
                        />
                        <StockBadge status={s} />
                      </label>
                    ))}
                    {stockStatus && (
                      <button
                        onClick={() => { setStockStatus(""); setPage(1); }}
                        className="text-xs font-bold mt-2"
                        style={{ color: "#f87171" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Origin */}
                <div className="mb-5">
                  <h4 className="text-sm font-bold mb-3" style={{ color:"rgba(255,255,255,0.9)" }}>
                    Country of Origin
                  </h4>
                  <input
                    type="text"
                    placeholder="e.g. India, China..."
                    value={origin}
                    onChange={(e) => { setOrigin(e.target.value); setPage(1); }}
                    className="w-full p-2 rounded-lg text-sm dark-input"
                  />
                </div>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">

              {/* ── Toolbar ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all"
                    style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)" }}
                  >
                    <FiFilter size={14} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                            style={{ background:"#3b82f6", color:"#fff" }}>
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <p className="text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
                    <span className="font-bold text-white">{total}</span> products
                    {category && (
                      <span className="ml-1">in <strong className="text-white">{category}</strong></span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="text-sm py-2 px-3 rounded-lg appearance-none font-bold outline-none cursor-pointer"
                    style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)" }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ background:"#0f172a", color:"#fff" }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* View Toggle */}
                  <div className="flex rounded-lg overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.15)" }}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className="p-2 transition-colors"
                      style={{
                        background: viewMode === "grid" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.04)",
                        color: viewMode === "grid" ? "#fff" : "rgba(255,255,255,0.4)"
                      }}
                    >
                      <FiGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className="p-2 transition-colors"
                      style={{
                        background: viewMode === "list" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.04)",
                        color: viewMode === "list" ? "#fff" : "rgba(255,255,255,0.4)"
                      }}
                    >
                      <FiList size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Active Filters ── */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {search && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      Search: "{search}"
                      <button onClick={() => setSearch("")}><FiX size={12} /></button>
                    </span>
                  )}
                  {category && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      {category}
                      <button onClick={() => setCategory("")}><FiX size={12} /></button>
                    </span>
                  )}
                  {currency && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      {currency}
                      <button onClick={() => setCurrency("")}><FiX size={12} /></button>
                    </span>
                  )}
                  {stockStatus && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      Stock: {stockStatus.replace("_", " ")}
                      <button onClick={() => setStockStatus("")}><FiX size={12} /></button>
                    </span>
                  )}
                  {isFeatured && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.3)" }}>
                      ⭐ Featured
                      <button onClick={() => setIsFeatured(false)}><FiX size={12} /></button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      Price: {minPrice || "0"} - {maxPrice || "∞"}
                      <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><FiX size={12} /></button>
                    </span>
                  )}
                </div>
              )}

              {/* ── Products ── */}
              {loading ? (
                <Spinner text="Loading products..." />
              ) : products.length === 0 ? (
                <div className="text-center py-20 rounded-xl"
                     style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                  <FiPackage className="text-7xl mx-auto mb-4" style={{ color:"rgba(255,255,255,0.2)" }} />
                  <h3 className="font-bold text-xl mb-2 text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                    No products found
                  </h3>
                  <p className="text-sm mb-5" style={{ color:"rgba(255,255,255,0.5)" }}>
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 rounded-lg font-bold transition-all relative overflow-hidden"
                    style={{ background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", boxShadow:"0 4px 15px rgba(59,130,246,0.3)" }}
                  >
                    <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <ProductListItem key={product._id} product={product} />
                      ))}
                    </div>
                  )}

                  {/* ── Pagination ── */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.12)" }}
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className="w-10 h-10 rounded-lg text-sm font-bold transition-all"
                          style={{
                            background: page === i + 1 ? "linear-gradient(135deg,#3b82f6,#1e40af)" : "rgba(255,255,255,0.06)",
                            color: "#fff",
                            border: page === i + 1 ? "none" : "1px solid rgba(255,255,255,0.12)",
                            boxShadow: page === i + 1 ? "0 4px 15px rgba(59,130,246,0.3)" : "none"
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.12)" }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── List View Item ──
const ProductListItem = ({ product }) => (
  <div className="rounded-xl p-4 flex gap-4 transition-transform hover:-translate-y-1"
       style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(15px)" }}>
    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ background:"rgba(0,0,0,0.3)" }}>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FiPackage className="text-3xl" style={{ color:"rgba(255,255,255,0.2)" }} />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color:"rgba(255,255,255,0.4)" }}>
            {product.category}
          </p>
          <h3 className="font-bold text-base line-clamp-1 text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
            {product.name}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg text-blue-400">
            {product.price.toLocaleString()} {product.currency}
          </p>
          <p className="text-[10px] font-bold uppercase" style={{ color:"rgba(255,255,255,0.4)" }}>/ {product.unit}</p>
        </div>
      </div>
      <p className="text-sm line-clamp-1 mt-1 font-medium" style={{ color:"rgba(255,255,255,0.6)" }}>
        {product.shortDescription || product.description}
      </p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {product.origin && (
            <span className="text-xs font-bold" style={{ color:"rgba(255,255,255,0.5)" }}>
              🌍 {product.origin}
            </span>
          )}
          <span className="text-xs font-bold" style={{ color:"rgba(255,255,255,0.5)" }}>
            MOQ: {product.minOrderQuantity} {product.unit}
          </span>
        </div>
        <div className="flex gap-2">
          <Link to={`/products/${product._id}`}
            className="text-xs font-bold px-4 py-2 rounded-lg transition-colors border"
            style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", borderColor:"rgba(59,130,246,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(59,130,246,0.15)"}
          >
            View
          </Link>
          <button
            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/products/${product._id}/pdf`, "_blank")}
            className="text-xs font-bold px-4 py-2 rounded-lg transition-colors border"
            style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", borderColor:"rgba(245,158,11,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(245,158,11,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(245,158,11,0.15)"}
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductList;