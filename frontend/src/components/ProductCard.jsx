import { Link, useNavigate } from "react-router-dom";
import {
  FiDownload, FiEye, FiTag, FiPackage,
  FiStar, FiMapPin, FiShoppingCart, FiMessageSquare,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:     { background:"rgba(16,185,129,0.15)", color:"#34d399", borderColor:"rgba(16,185,129,0.3)" },
    out_of_stock: { background:"rgba(239,68,68,0.15)", color:"#fca5a5", borderColor:"rgba(239,68,68,0.3)" },
    limited:      { background:"rgba(245,158,11,0.15)", color:"#fcd34d", borderColor:"rgba(245,158,11,0.3)" },
  };
  const labels = {
    in_stock:     "In Stock",
    out_of_stock: "Out of Stock",
    limited:      "Limited",
  };
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border" style={styles[status] || styles.in_stock}>
      {labels[status] || "In Stock"}
    </span>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePdf = (e) => {
    e.preventDefault();
    window.open(`${import.meta.env.VITE_API_URL}/api/products/${product._id}/pdf`, "_blank");
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }
    if (product.stockStatus === "out_of_stock") {
      toast.error("This product is out of stock");
      return;
    }
    navigate(`/checkout/${product._id}`);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl transition-all duration-300 border backdrop-blur-md relative"
         style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.06)" }}
         onMouseEnter={e => {e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(0,0,0,0.5)";}}
         onMouseLeave={e => {e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow="none";}}>

      <style>{`
        @keyframes shimmer {
          0%,100% { transform:translateX(-100%); }
          60% { transform:translateX(100%); }
        }
      `}</style>

      {/* ── Image ── */}
      <div className="relative h-56 overflow-hidden flex-shrink-0" style={{ background:"rgba(255,255,255,0.02)" }}>
        {product.imageUrl ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x300/1e293b/475569?text=No+Img";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-80" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize:"20px 20px" }} />
            <FiPackage className="text-6xl relative z-10" style={{ color:"rgba(255,255,255,0.1)" }} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
          {product.isFeatured && (
            <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg border"
                  style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", borderColor:"rgba(245,158,11,0.5)" }}>
              <FiStar size={10} /> FEATURED
            </span>
          )}
          {product.isBulkUploaded && (
            <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg border"
                  style={{ background:"linear-gradient(135deg,#3b82f6,#1d4ed8)", color:"#fff", borderColor:"rgba(59,130,246,0.5)" }}>
              BULK
            </span>
          )}
        </div>

        {/* Currency */}
        <span className="absolute top-3 right-3 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow-lg border z-20"
              style={{ background:"rgba(15,37,64,0.8)", color:"#93c5fd", borderColor:"rgba(147,197,253,0.3)", backdropFilter:"blur(4px)" }}>
          {product.currency}
        </span>

        {/* Stock overlay */}
        {product.stockStatus === "out_of_stock" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(2px)" }}>
            <span className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border shadow-xl"
                  style={{ background:"rgba(239,68,68,0.2)", color:"#fca5a5", borderColor:"rgba(239,68,68,0.5)" }}>
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-grow relative z-10">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[30px] transition-opacity duration-300 opacity-0 group-hover:opacity-100"
             style={{ background:"#3b82f6" }} />

        {/* Category + Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <FiTag size={11} style={{ color:"#f59e0b" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]" style={{ color:"rgba(255,255,255,0.4)" }}>
              {product.category}
            </span>
          </div>
          <StockBadge status={product.stockStatus} />
        </div>

        {/* Name */}
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-amber-400 transition-colors tracking-wide" style={{ fontFamily:"Poppins,sans-serif" }}>
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-[13px] font-medium leading-relaxed line-clamp-2 mb-4 flex-grow" style={{ color:"rgba(255,255,255,0.5)" }}>
          {product.shortDescription || product.description}
        </p>

        {/* Origin */}
        {product.origin && (
          <div className="flex items-center gap-1.5 mb-3">
            <FiMapPin size={12} style={{ color:"rgba(255,255,255,0.3)" }} />
            <span className="text-xs font-medium truncate" style={{ color:"rgba(255,255,255,0.6)" }}>
              {product.origin}
            </span>
          </div>
        )}

        {/* Price & MOQ */}
        <div className="flex items-end justify-between mb-4 pb-4 border-b" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:"rgba(255,255,255,0.4)" }}>Price</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                {product.price.toLocaleString()}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.5)" }}>
                {product.currency} / {product.unit}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:"rgba(255,255,255,0.4)" }}>MOQ</p>
            <p className="text-sm font-bold text-white tracking-wide">
              {product.minOrderQuantity} <span className="text-xs font-semibold" style={{ color:"rgba(255,255,255,0.5)" }}>{product.unit}</span>
            </p>
          </div>
        </div>

        {/* Lead time + Payment */}
        {(product.leadTime || product.paymentTerms) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.leadTime && (
              <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1"
                    style={{ background:"rgba(59,130,246,0.1)", color:"#93c5fd", borderColor:"rgba(59,130,246,0.2)" }}>
                <span className="mr-0.5">🚚</span> {product.leadTime}
              </span>
            )}
            {product.paymentTerms && (
              <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1"
                    style={{ background:"rgba(16,185,129,0.1)", color:"#6ee7b7", borderColor:"rgba(16,185,129,0.2)" }}>
                <span className="mr-0.5">💳</span> {product.paymentTerms}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border"
                    style={{ background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.5)", borderColor:"rgba(255,255,255,0.08)" }}>
                #{tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider border"
                    style={{ background:"transparent", color:"rgba(255,255,255,0.3)", borderColor:"rgba(255,255,255,0.05)" }}>
                +{product.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.certifications.slice(0, 2).map((cert, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex items-center gap-0.5"
                    style={{ background:"rgba(245,158,11,0.05)", color:"#fcd34d", borderColor:"rgba(245,158,11,0.15)" }}>
                 ✓ {cert}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-5 pb-1">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.35)" }}>
            <FiEye size={12} /> {product.views || 0}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.35)" }}>
            <FiMessageSquare size={12} /> {product.inquiryCount || 0}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all border font-bold text-xs uppercase tracking-wider"
            style={{ background:"rgba(255,255,255,0.05)", borderColor:"rgba(255,255,255,0.1)", color:"#fff" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
          >
            <FiEye size={14} /> VIEW
          </Link>
          <button
            onClick={handleBuyNow}
            disabled={product.stockStatus === "out_of_stock"}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider relative overflow-hidden"
            style={{ 
              background: product.stockStatus === "out_of_stock" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#f59e0b,#d97706)", 
              color: product.stockStatus === "out_of_stock" ? "rgba(255,255,255,0.3)" : "#fff",
              boxShadow: product.stockStatus === "out_of_stock" ? "none" : "0 4px 15px rgba(245,158,11,0.3)",
              cursor: product.stockStatus === "out_of_stock" ? "not-allowed" : "pointer"
            }}
          >
            {product.stockStatus !== "out_of_stock" && <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 60%)", animation:"shimmer 3s ease-in-out infinite" }} />}
            <FiShoppingCart size={14} className="relative z-10" />
            <span className="relative z-10">ORDER</span>
          </button>
          <button
            onClick={handlePdf}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl transition-all border"
            style={{ background:"transparent", borderColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)" }}
            onMouseEnter={e => {e.currentTarget.style.borderColor="rgba(245,158,11,0.4)"; e.currentTarget.style.color="#fcd34d"; e.currentTarget.style.background="rgba(245,158,11,0.05)";}}
            onMouseLeave={e => {e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; e.currentTarget.style.background="transparent";}}
            title="Download PDF"
          >
            <FiDownload size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;