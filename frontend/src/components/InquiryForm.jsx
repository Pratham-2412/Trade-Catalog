import { useState } from "react";
import {
  FiSend, FiUser, FiMail, FiPhone,
  FiMessageSquare, FiPackage, FiX,
} from "react-icons/fi";
import { createInquiry } from "../api/products";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const InquiryForm = ({ product, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:     user?.name  || "",
    email:    user?.email || "",
    phone:    "",
    company:  "",
    country:  "",
    message:  `I am interested in ${product.name}. Please send me more details.`,
    quantity: product.minOrderQuantity || 1,
    unit:     product.unit || "piece",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error("Name, email and message are required");
    }
    try {
      setLoading(true);
      await createInquiry(product._id, form);
      toast.success("Inquiry sent successfully! ✅");
      onClose?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border p-6 relative overflow-hidden backdrop-blur-xl"
         style={{ background:"rgba(10,22,40,0.85)", borderColor:"rgba(255,255,255,0.08)", boxShadow:"0 25px 50px -12px rgba(0,0,0,0.5)" }}>
         
      <style>{`
        @keyframes shimmerInquiry {
          0%,100% { transform:translateX(-100%); }
          60% { transform:translateX(100%); }
        }
      `}</style>
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10 border-b pb-4" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
        <div>
          <h3 className="font-bold text-2xl text-white tracking-wide flex items-center gap-2" style={{ fontFamily:"Poppins,sans-serif" }}>
            <FiMessageSquare style={{ color:"#f59e0b" }} /> Send Inquiry
          </h3>
          <p className="text-sm mt-1 flex gap-1" style={{ color:"rgba(255,255,255,0.5)" }}>
            About: <span className="font-semibold" style={{ color:"#93c5fd" }}>
              {product.name}
            </span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ color:"rgba(255,255,255,0.5)", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}
            onMouseEnter={e => {e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
            onMouseLeave={e => {e.currentTarget.style.color="rgba(255,255,255,0.5)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)";}}
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Full Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.4)" }} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Email *</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.4)" }} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>
        </div>

        {/* Phone + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"rgba(255,255,255,0.4)" }} />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Your company name"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        </div>

        {/* Country + Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country"
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Quantity Required</label>
            <div className="flex gap-2">
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="unit"
                className="w-24 px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none text-center"
                style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
                onFocus={e => e.target.style.borderColor = "#3b82f6"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Message *</label>
          <div className="relative">
            <FiMessageSquare className="absolute left-3.5 top-3.5" style={{ color:"rgba(255,255,255,0.4)" }} />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your requirements..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none resize-none"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="rounded-xl p-4 flex items-center gap-4 border" style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.06)" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.1)" }}>
            <FiPackage size={20} style={{ color:"#93c5fd" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Inquiring about</p>
            <p className="text-sm font-semibold truncate text-white">
              {product.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>Price</p>
            <p className="text-sm font-bold text-amber-400">
              {product.price} {product.currency}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl transition-all font-bold text-sm tracking-wider uppercase relative overflow-hidden flex items-center justify-center gap-2"
          style={{ 
            background:"linear-gradient(135deg,#f59e0b,#d97706)", 
            color:"#fff", 
            boxShadow:"0 10px 25px -5px rgba(245,158,11,0.5)",
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 15px 30px -5px rgba(245,158,11,0.6)"; } }}
          onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 10px 25px -5px rgba(245,158,11,0.5)"; } }}
        >
          {!loading && <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.2) 50%,rgba(255,255,255,0) 60%)", animation:"shimmerInquiry 3s ease-in-out infinite" }} />}
          {loading ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              SENDING...
            </>
          ) : (
            <>
              <FiSend size={16} className="relative z-10" />
              <span className="relative z-10">SEND INQUIRY</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;