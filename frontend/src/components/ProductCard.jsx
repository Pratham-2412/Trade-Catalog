import { Link } from "react-router-dom";
import {
  FiDownload, FiEye, FiTag, FiPackage,
  FiStar, FiMapPin, FiShoppingCart, FiMessageSquare,
} from "react-icons/fi";

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:     "bg-green-100 text-green-700",
    out_of_stock: "bg-red-100 text-red-700",
    limited:      "bg-orange-100 text-orange-700",
  };
  const labels = {
    in_stock:     "In Stock",
    out_of_stock: "Out of Stock",
    limited:      "Limited",
  };
  return (
    <span className={`badge text-xs ${styles[status] || styles.in_stock}`}>
      {labels[status] || "In Stock"}
    </span>
  );
};

const ProductCard = ({ product }) => {
  const handlePdf = (e) => {
    e.preventDefault();
    window.open(`${import.meta.env.VITE_API_URL}/api/products/${product._id}/pdf`, "_blank");
  };

  return (
    <div className="card group flex flex-col overflow-hidden
                    hover:-translate-y-1 transition-all duration-300">

      {/* ── Image ── */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          bg-gradient-to-br from-gray-50 to-gray-100">
            <FiPackage className="text-gray-300 text-5xl" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="badge bg-trade-gold text-white text-xs
                             flex items-center gap-1">
              <FiStar size={10} /> Featured
            </span>
          )}
          {product.isBulkUploaded && (
            <span className="badge bg-blue-100 text-blue-700 text-xs">
              Bulk
            </span>
          )}
        </div>

        {/* Currency */}
        <span className="absolute top-2 right-2 badge bg-trade-navy
                         text-white text-xs">
          {product.currency}
        </span>

        {/* Stock overlay */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute inset-0 bg-black/40 flex items-center
                          justify-center">
            <span className="bg-red-500 text-white text-sm font-medium
                             px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Category + Stock */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <FiTag className="text-trade-gold text-xs" />
            <span className="text-xs text-gray-500 uppercase
                             tracking-wide font-medium truncate max-w-[120px]">
              {product.category}
            </span>
          </div>
          <StockBadge status={product.stockStatus} />
        </div>

        {/* Name */}
        <h3 className="font-display font-semibold text-gray-900
                       text-base mb-1 line-clamp-1 group-hover:text-trade-navy
                       transition-colors">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-grow">
          {product.shortDescription || product.description}
        </p>

        {/* Origin */}
        {product.origin && (
          <div className="flex items-center gap-1 mb-2">
            <FiMapPin className="text-gray-300 text-xs flex-shrink-0" />
            <span className="text-xs text-gray-400 truncate">
              {product.origin}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-trade-navy">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400">
                {product.currency} / {product.unit}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">MOQ</p>
            <p className="text-sm font-semibold text-gray-700">
              {product.minOrderQuantity} {product.unit}
            </p>
          </div>
        </div>

        {/* Lead time + Payment */}
        {(product.leadTime || product.paymentTerms) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.leadTime && (
              <span className="text-xs bg-blue-50 text-blue-600
                               px-2 py-0.5 rounded-full">
                🚚 {product.leadTime}
              </span>
            )}
            {product.paymentTerms && (
              <span className="text-xs bg-green-50 text-green-600
                               px-2 py-0.5 rounded-full">
                💳 {product.paymentTerms}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={i}
                className="badge bg-gray-100 text-gray-500 text-xs">
                #{tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="badge bg-gray-100 text-gray-400 text-xs">
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.certifications.slice(0, 2).map((cert, i) => (
              <span key={i}
                className="badge bg-amber-50 text-amber-700 text-xs">
                ✓ {cert}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <FiEye size={11} /> {product.views || 0} views
          </span>
          <span className="flex items-center gap-1">
            <FiMessageSquare size={11} />
            {product.inquiryCount || 0} inquiries
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-1.5
                       bg-trade-navy text-white text-sm py-2.5 rounded-xl
                       hover:bg-blue-800 transition-colors font-medium"
          >
            <FiEye size={14} />
            View
          </Link>
          <button
            onClick={handleBuyNow}
            disabled={product.stockStatus === "out_of_stock"}
            className="flex-1 flex items-center justify-center gap-1.5
                       bg-trade-gold text-white text-sm py-2.5 rounded-xl
                       hover:bg-amber-600 transition-colors font-bold
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={14} />
            Order
          </button>
          <button
            onClick={handlePdf}
            className="flex items-center justify-center gap-1.5
                       border border-gray-100 text-gray-400
                       text-sm py-2.5 px-3 rounded-xl
                       hover:border-trade-gold hover:text-trade-gold
                       transition-colors font-medium"
          >
            <FiDownload size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;