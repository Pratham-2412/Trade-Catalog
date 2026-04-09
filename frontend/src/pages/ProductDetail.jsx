import { useState, useEffect } from "react";
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

const StockBadge = ({ status }) => {
  const styles = {
    in_stock:     "bg-green-100 text-green-700 border border-green-200",
    out_of_stock: "bg-red-100 text-red-700 border border-red-200",
    limited:      "bg-orange-100 text-orange-700 border border-orange-200",
  };
  const labels = {
    in_stock:     "✓ In Stock",
    out_of_stock: "✗ Out of Stock",
    limited:      "⚠ Limited Stock",
  };
  return (
    <span className={`badge px-3 py-1.5 text-sm font-medium
                      ${styles[status] || styles.in_stock}`}>
      {labels[status] || "In Stock"}
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3
                    border-b border-gray-100 last:border-0">
      <div className="bg-trade-light p-2 rounded-lg mt-0.5">
        <Icon className="text-trade-navy text-sm" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium
                      uppercase tracking-wide">
          {label}
        </p>
        <p className="text-gray-900 font-medium mt-0.5">{value}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back */}
      <Link to="/"
        className="inline-flex items-center gap-2 text-gray-500
                   hover:text-trade-navy text-sm font-medium mb-6
                   transition-colors">
        <FiArrowLeft />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* ── Left: Images ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100
                          overflow-hidden shadow-sm mb-3 relative">
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
              <div className="w-full h-96 flex items-center justify-center
                              bg-gray-50">
                <FiPackage className="text-gray-200 text-8xl" />
              </div>
            )}

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="badge bg-trade-gold text-white
                                 flex items-center gap-1">
                  <FiStar size={12} /> Featured
                </span>
              )}
              <StockBadge status={product.stockStatus} />
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg
                              overflow-hidden border-2 transition-all ${
                    activeImage === i
                      ? "border-trade-navy"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt=""
                    className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag, i) => (
                <span key={i}
                  className="badge bg-blue-50 text-blue-600 px-3 py-1">
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
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <FiTag className="text-trade-gold" />
                {product.category}
              </span>
              {product.origin && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <FiMapPin size={12} />
                  {product.origin}
                </span>
              )}
              {product.isBulkUploaded && (
                <span className="badge bg-blue-100 text-blue-700 text-xs">
                  Bulk Upload
                </span>
              )}
            </div>

            <h1 className="font-display font-bold text-3xl
                           text-trade-navy mb-2">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-gray-500 text-base">
                {product.shortDescription}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
          <div className="bg-gradient-to-r from-trade-navy to-blue-800
                          rounded-2xl p-5 mb-5 text-white">
            <p className="text-blue-200 text-sm mb-1">
              Price per {product.unit}
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display font-bold text-4xl">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xl text-blue-200">
                {product.currency}
              </span>
            </div>
            <div className="flex items-center justify-between
                            text-sm text-blue-200">
              <span>MOQ: {product.minOrderQuantity} {product.unit}</span>
              {product.maxOrderQuantity > 0 && (
                <span>Max: {product.maxOrderQuantity} {product.unit}</span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {product.leadTime && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiClock className="text-trade-gold text-sm" />
                  <p className="text-xs text-gray-400 font-medium">Lead Time</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {product.leadTime}
                </p>
              </div>
            )}
            {product.paymentTerms && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiCreditCard className="text-trade-gold text-sm" />
                  <p className="text-xs text-gray-400 font-medium">Payment</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {product.paymentTerms}
                </p>
              </div>
            )}
            {product.hsCode && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiHash className="text-trade-gold text-sm" />
                  <p className="text-xs text-gray-400 font-medium">HS Code</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {product.hsCode}
                </p>
              </div>
            )}
            {product.origin && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FiGlobe className="text-trade-gold text-sm" />
                  <p className="text-xs text-gray-400 font-medium">Origin</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
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
                  className="flex items-center gap-1 badge
                             bg-green-50 text-green-700 px-3 py-1">
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
              className="flex-1 flex items-center justify-center gap-2
                         bg-trade-gold text-white py-4 rounded-xl
                         font-bold hover:bg-amber-600 transition-all
                         shadow-lg shadow-amber-100 disabled:opacity-50
                         disabled:cursor-not-allowed text-lg"
            >
              <FiShoppingCart size={20} />
              {product.stockStatus === "out_of_stock"
                ? "Out of Stock"
                : "Buy Now"}
            </button>
            <button
              onClick={() => setShowInquiry(true)}
              className="flex-1 flex items-center justify-center gap-2
                         bg-trade-navy text-white py-4 rounded-xl
                         font-bold hover:bg-blue-800 transition-colors
                         text-lg shadow-lg shadow-blue-900/10"
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
              className="flex-1 flex items-center justify-center gap-2
                         bg-gray-100 text-gray-700 py-3
                         px-4 rounded-xl font-bold hover:bg-gray-200
                         transition-colors text-sm"
            >
              <FiDownload size={16} />
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2
                         bg-gray-100 text-gray-700 py-3
                         px-4 rounded-xl font-bold hover:bg-gray-200
                         transition-colors text-sm"
            >
              <FiShare2 size={16} />
              Share
            </button>
            {canEdit && (
              <Link
                to={`/add-product?edit=${product._id}`}
                className="flex items-center justify-center gap-1.5
                           border-2 border-trade-navy text-trade-navy
                           py-2.5 px-4 rounded-xl font-medium
                           hover:bg-trade-navy hover:text-white
                           transition-colors text-sm"
              >
                <FiEdit size={14} />
                Edit
              </Link>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-1.5
                           border-2 border-red-200 text-red-500
                           py-2.5 px-4 rounded-xl font-medium
                           hover:bg-red-500 hover:text-white
                           transition-colors text-sm disabled:opacity-50"
              >
                <FiTrash2 size={14} />
                {deleting ? "..." : "Delete"}
              </button>
            )}
          </div>

          {/* Professional Dual Code Label */}
          {product.name && (
            <div className="mt-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden group">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* ── Left: Search QR ── */}
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-2 border border-gray-100 rounded-xl shadow-sm">
                    <QRCode 
                       value={`https://www.google.com/search?q=${encodeURIComponent(product.name)}`} 
                       size={80} 
                       renderAs="svg"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    Google Search
                  </p>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-20 bg-gray-100" />

                {/* ── Right: Product Barcode (HSN) ── */}
                <div className="flex-1 flex flex-col items-center">
                  <Barcode 
                    value={product.hsCode || "00000000"} 
                    displayValue={true} 
                  />
                  <div className="mt-3 text-center">
                    <p className="text-[11px] font-bold text-gray-900 uppercase">
                      {product.name}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
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
      <div className="bg-white rounded-2xl border border-gray-100
                      shadow-sm mb-8">
        <div className="flex border-b border-gray-100 overflow-x-auto
                        scrollbar-hide">
          {[
            { id: "details",     label: "Details"        },
            { id: "specs",       label: "Specifications" },
            { id: "description", label: "Description"    },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap
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

        <div className="p-6">
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
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
                <h4 className="font-semibold text-gray-900 mb-3">
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
                      <tr key={i}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-3 px-4 font-medium text-gray-700
                                       w-1/3 rounded-l-lg">
                          {spec.key}
                        </td>
                        <td className="py-3 px-4 text-gray-900 rounded-r-lg">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No specifications available
              </p>
            )
          )}

          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
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
          <div className="bg-gradient-to-r from-trade-navy to-blue-800
                          rounded-2xl p-8 text-white text-center">
            <FiMessageSquare className="text-4xl mx-auto mb-3 text-trade-gold" />
            <h3 className="font-display font-bold text-2xl mb-2">
              Interested in this product?
            </h3>
            <p className="text-blue-200 mb-5">
              Send us an inquiry and we'll get back to you within 24 hours
            </p>
            <button
              onClick={() => setShowInquiry(true)}
              className="bg-trade-gold text-white px-8 py-3 rounded-xl
                         font-medium hover:bg-amber-600 transition-colors"
            >
              Send Inquiry Now
            </button>
          </div>
        )}
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-2xl text-trade-navy mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;