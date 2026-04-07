import { useState, useEffect, useCallback } from "react";
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

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:    "bg-green-100 text-green-700",
    out_of_stock:"bg-red-100 text-red-700",
    limited:     "bg-orange-100 text-orange-700",
  };
  const labels = {
    in_stock:    "In Stock",
    out_of_stock:"Out of Stock",
    limited:     "Limited",
  };
  return (
    <span className={`badge ${styles[status]}`}>
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

  // ── Fetch categories ──
  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data))
      .catch(console.error);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Hero Section ── */}
      <div className="bg-gradient-to-r from-trade-navy to-blue-800
                      rounded-2xl p-8 mb-8 text-white">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          Global Trade Catalog
        </h1>
        <p className="text-blue-200 mb-6">
          Discover {total.toLocaleString()} premium import-export products
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2
                               text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search products, categories, origins..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900
                       placeholder-gray-400 text-sm focus:outline-none
                       focus:ring-2 focus:ring-trade-gold"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         text-gray-400 hover:text-gray-600"
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
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full
                      text-sm font-medium whitespace-nowrap transition-all ${
            !category
              ? "bg-trade-navy text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-trade-navy"
          }`}
        >
          All Products
          <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
            {total}
          </span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => { setCategory(cat.name); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full
                        text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.name
                ? "bg-trade-navy text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-trade-navy"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              category === cat.name
                ? "bg-white/20"
                : "bg-gray-100"
            }`}>
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
          <div className="bg-white rounded-xl border border-gray-100
                          shadow-sm p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-gray-900">
                Filters
              </h3>
              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="text-xs text-red-500 hover:text-red-700
                             font-medium transition-colors"
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
                  className="w-4 h-4 accent-trade-navy"
                />
                <span className="text-sm font-medium text-gray-700
                                 flex items-center gap-1">
                  <FiStar className="text-trade-gold" size={14} />
                  Featured Only
                </span>
              </label>
            </div>

            {/* Price Range */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Price Range
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Currency
              </h4>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCurrency(currency === c ? "" : c); setPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium
                                border transition-all ${
                      currency === c
                        ? "bg-trade-navy text-white border-trade-navy"
                        : "border-gray-200 text-gray-600 hover:border-trade-navy"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Stock Status
              </h4>
              <div className="space-y-2">
                {STOCK.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="stockStatus"
                      checked={stockStatus === s}
                      onChange={() => { setStockStatus(s); setPage(1); }}
                      className="accent-trade-navy"
                    />
                    <StockBadge status={s} />
                  </label>
                ))}
                {stockStatus && (
                  <button
                    onClick={() => { setStockStatus(""); setPage(1); }}
                    className="text-xs text-red-400 hover:text-red-600 mt-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Origin */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Country of Origin
              </h4>
              <input
                type="text"
                placeholder="e.g. India, China..."
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setPage(1); }}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center justify-between
                          gap-3 mb-5">
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-2
                           rounded-lg border border-gray-200 text-sm
                           font-medium text-gray-600 hover:border-trade-navy"
              >
                <FiFilter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-trade-navy text-white text-xs
                                   w-5 h-5 rounded-full flex items-center
                                   justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{total}</span> products
                {category && (
                  <span className="ml-1">in <strong>{category}</strong></span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="input-field text-sm py-2 pr-8"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-trade-navy text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-trade-navy text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
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
                <span className="flex items-center gap-1 bg-blue-50
                                 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {category && (
                <span className="flex items-center gap-1 bg-blue-50
                                 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                  {category}
                  <button onClick={() => setCategory("")}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {currency && (
                <span className="flex items-center gap-1 bg-blue-50
                                 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                  {currency}
                  <button onClick={() => setCurrency("")}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {stockStatus && (
                <span className="flex items-center gap-1 bg-blue-50
                                 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                  <StockBadge status={stockStatus} />
                  <button onClick={() => setStockStatus("")}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {isFeatured && (
                <span className="flex items-center gap-1 bg-trade-gold/10
                                 text-amber-700 text-xs px-3 py-1.5 rounded-full">
                  ⭐ Featured
                  <button onClick={() => setIsFeatured(false)}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 bg-blue-50
                                 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                  Price: {minPrice || "0"} - {maxPrice || "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* ── Products ── */}
          {loading ? (
            <Spinner text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl
                            border border-gray-100">
              <FiPackage className="text-gray-200 text-7xl mx-auto mb-4" />
              <h3 className="font-display font-semibold text-gray-400
                             text-xl mb-2">
                No products found
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={handleReset}
                className="btn-primary text-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2
                                xl:grid-cols-3 gap-5">
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
                    className="px-4 py-2 rounded-lg border border-gray-200
                               text-sm font-medium text-gray-600
                               hover:border-trade-navy disabled:opacity-40
                               disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium
                                  transition-colors ${
                        page === i + 1
                          ? "bg-trade-navy text-white"
                          : "border border-gray-200 text-gray-600 hover:border-trade-navy"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200
                               text-sm font-medium text-gray-600
                               hover:border-trade-navy disabled:opacity-40
                               disabled:cursor-not-allowed transition-colors"
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
  );
};

// ── List View Item ──
const ProductListItem = ({ product }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm
                  p-4 flex gap-4 hover:shadow-md transition-shadow">
    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0
                    bg-gray-100">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name}
          className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FiPackage className="text-gray-300 text-2xl" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-display font-semibold text-gray-900
                         text-base line-clamp-1">
            {product.name}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-trade-navy text-lg">
            {product.price.toLocaleString()} {product.currency}
          </p>
          <p className="text-xs text-gray-400">/ {product.unit}</p>
        </div>
      </div>
      <p className="text-gray-500 text-sm line-clamp-1 mt-1">
        {product.shortDescription || product.description}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {product.origin && (
            <span className="text-xs text-gray-400">
              🌍 {product.origin}
            </span>
          )}
          <span className="text-xs text-gray-400">
            MOQ: {product.minOrderQuantity} {product.unit}
          </span>
        </div>
        <div className="flex gap-2">
          <Link to={`/products/${product._id}`}
            className="text-xs bg-trade-navy text-white px-3 py-1.5
                       rounded-lg hover:bg-blue-800 transition-colors">
            View
          </Link>
          <button
            onClick={() => window.open(`/api/products/${product._id}/pdf`, "_blank")}
            className="text-xs bg-trade-gold text-white px-3 py-1.5
                       rounded-lg hover:bg-amber-600 transition-colors">
            PDF
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProductList;