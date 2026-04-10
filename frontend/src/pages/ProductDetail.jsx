import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft, FiDownload, FiPackage, FiTag,
  FiGlobe, FiHash, FiShoppingCart, FiEdit,
  FiTrash2, FiStar, FiEye, FiMessageSquare,
  FiClock, FiCreditCard, FiShare2, FiMapPin,
  FiCheckCircle,
} from "react-icons/fi";
import { fetchProductById, deleteProduct } from "../api/products";
import { useAuth } from "../context/AuthContext";
import InquiryForm from "../components/InquiryForm";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import Barcode from "../components/Barcode";
import { QRCodeSVG as QRCode } from "qrcode.react";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 30;

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:     { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    out_of_stock: { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
    limited:      { bg: "rgba(249,115,22,0.15)",  color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  };
  const labels = {
    in_stock:     "✓ In Stock",
    out_of_stock: "✗ Out of Stock",
    limited:      "⚠ Limited Stock",
  };
  const theme = styles[status] || styles.in_stock;

  return (
    <span className="px-3 py-1.5 text-xs font-bold rounded-md tracking-wider"
          style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}>
      {labels[status] || "In Stock"}
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
      <div className="p-2 rounded-lg mt-0.5" style={{ background:"rgba(255,255,255,0.05)" }}>
        <Icon style={{ color:"#60a5fa" }} className="text-sm" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.4)" }}>
          {label}
        </p>
        <p className="font-medium mt-0.5" style={{ color:"#fff" }}>{value}</p>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { user, canEdit, isAdmin } = useAuth();
  const [product,     setProduct]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [activeTab,   setActiveTab]   = useState("details");
  const particleRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchProductById(id);
        setProduct(data);
        setRelated(data.related || []);
      } catch {
        toast.error("Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  useEffect(() => {
    if (loading) return;
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
        bottom:${Math.random() * 40}%;
        animation:dotRise ${4 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 6}s;
      `;
      wrap.appendChild(d);
    }
  }, [loading]);

  useEffect(() => {
    if (window.location.hash === "#inquiry") {
      setShowInquiry(true);
      setTimeout(() => {
        document.getElementById("inquiry")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  }, [product]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setDeleting(true);
      await deleteProduct(id);
      toast.success("Product deleted");
      navigate("/");
    } catch (error) {
      toast.error(error.message);
      setDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleBuyNow = () => {
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

  const allImages = product
    ? [product.imageUrl, ...(product.images || [])].filter(Boolean)
    : [];

  if (loading) return <Spinner text="Loading product..." />;
  if (!product) return null;

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
      `}</style>

      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:450, height:450, background:"#3b82f6", filter:"blur(72px)", opacity:0.12, top:"-50px", right:"-100px", animation:"orbFloat 10s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:350, height:350, background:"#f59e0b", filter:"blur(72px)", opacity:0.08, bottom:"10%", left:"-100px", animation:"orbFloat 10s ease-in-out infinite", animationDelay:"3s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Back */}
          <Link to="/products"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            style={{ color:"rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.color="#fff"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.5)"}
          >
            <FiArrowLeft />
            Back to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* ── Left: Images ── */}
            <div>
              <div className="rounded-2xl overflow-hidden mb-3 relative"
                   style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}>
                {allImages.length > 0 ? (
                  <img
                    src={allImages[activeImage]}
                    alt={product.name}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gray-900">
                    <FiPackage className="text-gray-600 text-8xl" />
                  </div>
                )}

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-md tracking-wider flex items-center gap-1"
                          style={{ background:"rgba(245,158,11,0.15)", color:"#fbbf24", border:"1px solid rgba(245,158,11,0.3)" }}>
                      <FiStar size={12} /> Featured
                    </span>
                  )}
                  <StockBadge status={product.stockStatus} />
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: activeImage === i ? "#3b82f6" : "rgba(255,255,255,0.1)"
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-md text-xs font-medium"
                          style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Details ── */}
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
                    <FiTag style={{ color:"#f59e0b" }} />
                    {product.category}
                  </span>
                  {product.origin && (
                    <span className="flex items-center gap-1 text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
                      <FiMapPin size={12} />
                      {product.origin}
                    </span>
                  )}
                  {product.isBulkUploaded && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa" }}>
                      Bulk Upload
                    </span>
                  )}
                </div>

                <h1 className="font-bold text-3xl mb-2 text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                  {product.name}
                </h1>

                {product.shortDescription && (
                  <p className="text-base" style={{ color:"rgba(255,255,255,0.6)" }}>
                    {product.shortDescription}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                  <span className="flex items-center gap-1">
                    <FiEye size={12} /> {product.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMessageSquare size={12} />
                    {product.inquiryCount} inquiries
                  </span>
                </div>
              </div>

              {/* Price Box */}
              <div className="rounded-2xl p-5 mb-5 text-white"
                   style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.2),rgba(30,64,175,0.2))", border:"1px solid rgba(59,130,246,0.3)" }}>
                <p className="text-sm mb-1" style={{ color:"rgba(255,255,255,0.7)" }}>
                  Price per {product.unit}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-bold text-4xl text-blue-400" style={{ fontFamily:"Poppins,sans-serif" }}>
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xl" style={{ color:"#60a5fa" }}>
                    {product.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color:"#93c5fd" }}>
                  <span>MOQ: {product.minOrderQuantity} {product.unit}</span>
                  {product.maxOrderQuantity > 0 && (
                    <span>Max: {product.maxOrderQuantity} {product.unit}</span>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {product.leadTime && (
                  <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FiClock style={{ color:"#f59e0b" }} className="text-sm" />
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.4)" }}>Lead Time</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {product.leadTime}
                    </p>
                  </div>
                )}
                {product.paymentTerms && (
                  <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FiCreditCard style={{ color:"#f59e0b" }} className="text-sm" />
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.4)" }}>Payment</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {product.paymentTerms}
                    </p>
                  </div>
                )}
                {product.hsCode && (
                  <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FiHash style={{ color:"#f59e0b" }} className="text-sm" />
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.4)" }}>HS Code</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {product.hsCode}
                    </p>
                  </div>
                )}
                {product.origin && (
                  <div className="rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <FiGlobe style={{ color:"#f59e0b" }} className="text-sm" />
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:"rgba(255,255,255,0.4)" }}>Origin</p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {product.origin}
                    </p>
                  </div>
                )}
              </div>

              {/* Certifications */}
              {product.certifications?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {product.certifications.map((cert, i) => (
                    <span key={i}
                      className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider"
                      style={{ background:"rgba(34,197,94,0.15)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.3)" }}>
                      <FiCheckCircle size={12} />
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Action Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stockStatus === "out_of_stock"}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden"
                  style={{
                    background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none",
                    boxShadow:"0 6px 20px rgba(245,158,11,0.4)"
                  }}
                  onMouseEnter={e => {
                    if (product.stockStatus !== "out_of_stock") {
                      e.currentTarget.style.transform="translateY(-1px)";
                      e.currentTarget.style.boxShadow="0 8px 25px rgba(245,158,11,0.55)";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform="translateY(0)";
                    e.currentTarget.style.boxShadow="0 6px 20px rgba(245,158,11,0.4)";
                  }}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                  <FiShoppingCart size={20} />
                  {product.stockStatus === "out_of_stock"
                    ? "Out of Stock"
                    : "Buy Now"}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all text-lg relative overflow-hidden"
                  style={{
                    background:"rgba(255,255,255,0.1)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)",
                    boxShadow:"0 4px 15px rgba(0,0,0,0.2)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background="rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform="translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background="rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform="translateY(0)";
                  }}
                >
                  <FiMessageSquare size={18} />
                  Send Inquiry
                </button>
              </div>

              {/* PDF + Share + Edit + Delete Row */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL?.replace("/api", "") ||
                      "http://localhost:5000"}/api/products/${id}/pdf`,
                      "_blank"
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
                  style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                >
                  <FiDownload size={16} />
                  Download PDF
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors text-sm"
                  style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                >
                  <FiShare2 size={16} />
                  Share
                </button>
                {canEdit && (
                  <Link
                    to={`/add-product?edit=${product._id}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold transition-colors text-sm"
                    style={{ background:"transparent", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.5)" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <FiEdit size={14} />
                    Edit
                  </Link>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold transition-colors text-sm disabled:opacity-50"
                    style={{ background:"transparent", color:"#f87171", border:"1px solid rgba(239,68,68,0.5)" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <FiTrash2 size={14} />
                    {deleting ? "..." : "Delete"}
                  </button>
                )}
              </div>

              {/* Professional Dual Code Label */}
              {product.name && (
                <div className="mt-8 p-6 rounded-3xl relative overflow-hidden group"
                     style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
                  {/* Background accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" style={{ background:"rgba(59,130,246,0.1)" }} />
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* ── Left: Search QR ── */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-2 rounded-xl" style={{ background:"#fff" }}>
                        <QRCode 
                           value={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                           size={80} 
                           renderAs="svg"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Google Search
                      </p>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden md:block w-px h-20" style={{ background:"rgba(255,255,255,0.1)" }} />

                    {/* ── Right: Product Barcode (HSN) ── */}
                    <div className="flex-1 flex flex-col items-center">
                      <div style={{ background:"#fff", padding:"8px", borderRadius:"8px" }}>
                        <Barcode 
                          value={product.hsCode || "00000000"} 
                          displayValue={true} 
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-[11px] font-bold text-white uppercase">
                          {product.name}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                          OFFICIAL HSN / TRADE BARCODE
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="rounded-2xl mb-8" style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}>
            <div className="flex overflow-x-auto scrollbar-hide" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              {[
                { id: "details",     label: "Details"        },
                { id: "specs",       label: "Specifications" },
                { id: "description", label: "Description"    },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors"
                  style={{
                    borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
                    color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-3" style={{ fontFamily:"Poppins,sans-serif" }}>
                      Trade Information
                    </h4>
                    <DetailRow icon={FiShoppingCart} label="Min Order Qty"
                      value={`${product.minOrderQuantity} ${product.unit}`} />
                    <DetailRow icon={FiShoppingCart} label="Max Order Qty"
                      value={product.maxOrderQuantity > 0
                        ? `${product.maxOrderQuantity} ${product.unit}`
                        : "No limit"} />
                    <DetailRow icon={FiGlobe}   label="Country of Origin"
                      value={product.origin} />
                    <DetailRow icon={FiHash}    label="HS Code"
                      value={product.hsCode} />

                    <DetailRow icon={FiPackage} label="Unit"
                       value={product.unit} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-3" style={{ fontFamily:"Poppins,sans-serif" }}>
                      Commercial Terms
                    </h4>
                    <DetailRow icon={FiClock}       label="Lead Time"
                      value={product.leadTime} />
                    <DetailRow icon={FiCreditCard}  label="Payment Terms"
                      value={product.paymentTerms} />
                    <DetailRow icon={FiTag}         label="Category"
                      value={product.category} />
                    <DetailRow icon={FiCheckCircle} label="Certifications"
                      value={product.certifications?.join(", ")} />
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                product.specifications?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent" }}>
                            <td className="py-3 px-4 font-bold w-1/3 rounded-l-lg" style={{ color:"rgba(255,255,255,0.6)" }}>
                              {spec.key}
                            </td>
                            <td className="py-3 px-4 text-white rounded-r-lg font-medium">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 font-medium" style={{ color:"rgba(255,255,255,0.4)" }}>
                    No specifications available
                  </p>
                )
              )}

              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="leading-relaxed whitespace-pre-line" style={{ color:"rgba(255,255,255,0.8)" }}>
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Inquiry Form ── */}
          <div id="inquiry" className="mb-8">
            {showInquiry ? (
              <InquiryForm
                product={product}
                onClose={() => setShowInquiry(false)}
              />
            ) : (
              <div className="rounded-2xl p-8 text-white text-center"
                   style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.15),rgba(30,64,175,0.25))", border:"1px solid rgba(59,130,246,0.4)" }}>
                <FiMessageSquare className="text-4xl mx-auto mb-3" style={{ color:"#f59e0b" }} />
                <h3 className="font-bold text-2xl mb-2" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Interested in this product?
                </h3>
                <p className="mb-5" style={{ color:"rgba(255,255,255,0.7)" }}>
                  Send us an inquiry and we'll get back to you within 24 hours
                </p>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="px-8 py-3 rounded-xl font-bold relative overflow-hidden transition-transform"
                  style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none", boxShadow:"0 4px 15px rgba(245,158,11,0.3)" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
                >
                  <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                  Send Inquiry Now
                </button>
              </div>
            )}
          </div>

          {/* ── Related Products ── */}
          {related.length > 0 && (
            <div>
              <h2 className="font-bold text-2xl mb-5 text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;