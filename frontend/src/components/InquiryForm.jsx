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
    <div className="bg-white rounded-2xl border border-gray-100
                    shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-xl text-trade-navy">
            Send Inquiry
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">
            About: <span className="font-medium text-gray-600">
              {product.name}
            </span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-gray-400 text-sm" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2
                                 text-gray-400 text-sm" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Phone + Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2
                                  text-gray-400 text-sm" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="label">Company</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Your company name"
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Country + Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country"
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="label">Quantity Required</label>
            <div className="flex gap-2">
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="input-field text-sm"
              />
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="unit"
                className="input-field text-sm w-24"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="label">Message *</label>
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-3
                                        text-gray-400 text-sm" />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your requirements..."
              className="input-field pl-9 text-sm resize-none"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-trade-light rounded-xl p-3 flex items-center gap-3">
          <FiPackage className="text-trade-navy flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Inquiring about</p>
            <p className="text-sm font-medium text-trade-navy truncate">
              {product.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-bold text-trade-navy">
              {product.price} {product.currency}
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-trade-navy text-white font-medium
                     rounded-xl hover:bg-blue-800 transition-colors
                     disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-white/30
                              border-t-white animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <FiSend size={16} />
              Send Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;