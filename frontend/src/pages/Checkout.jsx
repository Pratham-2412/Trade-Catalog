import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiShoppingCart, FiMapPin, FiCreditCard,
  FiPackage, FiCheck, FiArrowLeft,
  FiAlertCircle, FiShield,
} from "react-icons/fi";
import { fetchProductById } from "../api/products";
import { createOrder, verifyPayment } from "../api/orders";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
];

const CURRENCY_RATES = {
  INR: 1, USD: 83, EUR: 90, GBP: 105,
  AED: 22.6, CNY: 11.5, JPY: 0.55,
};

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload   = () => resolve(true);
    script.onerror  = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StepIndicator = ({ current }) => {
  const steps = [
    { id: 1, label: "Product"  },
    { id: 2, label: "Shipping" },
    { id: 3, label: "Payment"  },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-9 h-9
                           rounded-full text-sm font-bold transition-all ${
            current >= step.id
              ? "bg-trade-navy text-white"
              : "bg-gray-100 text-gray-400"
          }`}>
            {current > step.id
              ? <FiCheck size={16} />
              : step.id
            }
          </div>
          <span className={`ml-2 text-sm font-medium hidden sm:block ${
            current >= step.id ? "text-trade-navy" : "text-gray-400"
          }`}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-3 transition-all ${
              current > step.id ? "bg-trade-navy" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Checkout = () => {
  const { productId }  = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [step,     setStep]     = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [notes,    setNotes]    = useState("");

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    email:    user?.email || "",
    phone:    "",
    company:  "",
    address:  "",
    city:     "",
    state:    "Gujarat",
    country:  "India",
    pincode:  "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProductById(productId);
        setProduct(data);
        setQuantity(data.minOrderQuantity || 1);
      } catch {
        toast.error("Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, navigate]);

  // ── Price calculations ──
  const priceINR    = product
    ? Math.round(product.price * (CURRENCY_RATES[product.currency] || 83))
    : 0;
  const subtotal    = priceINR * quantity;
  const tax         = Math.round(subtotal * 0.18);
  const shipping_   = subtotal > 50000 ? 0 : 500;
  const total       = subtotal + tax + shipping_;

  const handleShippingChange = (e) => {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateShipping = () => {
    const required = [
      "fullName","email","phone","address","city","state","pincode"
    ];
    const missing = required.filter((f) => !shipping[f]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return false;
    }
    if (!/^\d{6}$/.test(shipping.pincode)) {
      toast.error("Invalid pincode (6 digits required)");
      return false;
    }
    if (!/^\d{10}$/.test(shipping.phone)) {
      toast.error("Invalid phone (10 digits required)");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateShipping()) return;

    try {
      setPaying(true);

      // ── Load Razorpay ──
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // ── Create order ──
      const { data } = await createOrder({
        productId:       product._id,
        quantity,
        shippingAddress: shipping,
        notes,
      });

      // ── Razorpay options ──
      const options = {
        key:         data.key,
        amount:      data.razorpayOrder.amount,
        currency:    "INR",
        name:        "TradeCatalog",
        description: product.name,
        order_id:    data.razorpayOrder.id,
        image:       product.imageUrl ||
          "https://placehold.co/200x200?text=TC",

        // ── Payment handler ──
        handler: async (response) => {
          try {
            const verify = await verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             data.order._id,
            });

            toast.success("Payment successful! 🎉");
            navigate(`/order-success/${data.order._id}`);
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },

        // ── Pre-fill user info ──
        prefill: {
          name:    shipping.fullName,
          email:   shipping.email,
          contact: shipping.phone,
        },

        // ── Theme matching website ──
        theme: {
          color:        "#1a3c5e",
          backdrop_color: "rgba(0,0,0,0.7)",
        },

        // ── Modal settings ──
        modal: {
          ondismiss: () => {
            toast("Payment cancelled", { icon: "ℹ️" });
            setPaying(false);
          },
          animation:    true,
          confirm_close: true,
        },

        // ── Notes ──
        notes: {
          product:  product.name,
          quantity: quantity.toString(),
          userId:   user._id,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });
      razorpay.open();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Spinner text="Loading product..." />;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
          className="flex items-center gap-2 text-gray-500
                     hover:text-trade-navy text-sm font-medium
                     transition-colors mb-4"
        >
          <FiArrowLeft size={16} />
          {step === 1 ? "Back to Product" : "Previous Step"}
        </button>
        <h1 className="font-display font-bold text-3xl text-trade-navy">
          Checkout
        </h1>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Form ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1 — Product & Quantity */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-6">
              <h2 className="font-display font-semibold text-xl
                             text-gray-900 mb-5 flex items-center gap-2">
                <FiPackage className="text-trade-gold" />
                Product Details
              </h2>

              {/* Product Card */}
              <div className="flex gap-4 p-4 bg-trade-light rounded-xl mb-6">
                <div className="w-20 h-20 rounded-xl overflow-hidden
                                flex-shrink-0 bg-gray-100">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/80x80";
                      }} />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center">
                      <FiPackage className="text-gray-300 text-2xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-gray-900
                                 text-base truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {product.category}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Origin: {product.origin || "N/A"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-trade-navy text-lg">
                    ₹{priceINR.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">per {product.unit}</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-5">
                <label className="label">
                  Quantity ({product.unit})
                  <span className="text-gray-400 font-normal ml-2 text-xs">
                    Min: {product.minOrderQuantity}
                    {product.maxOrderQuantity > 0 &&
                      ` · Max: ${product.maxOrderQuantity}`}
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200
                                  rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(
                        Math.max(product.minOrderQuantity, quantity - 1)
                      )}
                      className="px-4 py-3 text-gray-500 hover:bg-gray-50
                                 font-medium transition-colors text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(
                          product.minOrderQuantity, val
                        ));
                      }}
                      className="w-20 text-center py-3 border-x
                                 border-gray-200 focus:outline-none
                                 text-trade-navy font-bold"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-gray-500 hover:bg-gray-50
                                 font-medium transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {quantity} {product.unit} ×
                    ₹{priceINR.toLocaleString()} =
                    <span className="font-bold text-trade-navy ml-1">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">
                  Special Instructions
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special requirements..."
                  className="input-field resize-none text-sm"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-5 py-3.5 bg-trade-navy text-white
                           font-medium rounded-xl hover:bg-blue-800
                           transition-colors flex items-center
                           justify-center gap-2"
              >
                Continue to Shipping →
              </button>
            </div>
          )}

          {/* STEP 2 — Shipping Address */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-6">
              <h2 className="font-display font-semibold text-xl
                             text-gray-900 mb-5 flex items-center gap-2">
                <FiMapPin className="text-trade-gold" />
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleShippingChange}
                      placeholder="Pratham Shah"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={shipping.email}
                      onChange={handleShippingChange}
                      placeholder="you@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      name="phone"
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      placeholder="10 digit number"
                      maxLength={10}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input
                      name="company"
                      value={shipping.company}
                      onChange={handleShippingChange}
                      placeholder="Your company name"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Full Address *</label>
                  <textarea
                    name="address"
                    value={shipping.address}
                    onChange={handleShippingChange}
                    placeholder="House/Flat No, Street, Area"
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      placeholder="Ahmedabad"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <select
                      name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      className="input-field"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input
                      name="pincode"
                      value={shipping.pincode}
                      onChange={handleShippingChange}
                      placeholder="380001"
                      maxLength={6}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Country</label>
                  <input
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (validateShipping()) setStep(3);
                }}
                className="w-full mt-6 py-3.5 bg-trade-navy text-white
                           font-medium rounded-xl hover:bg-blue-800
                           transition-colors flex items-center
                           justify-center gap-2"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-6">
              <h2 className="font-display font-semibold text-xl
                             text-gray-900 mb-5 flex items-center gap-2">
                <FiCreditCard className="text-trade-gold" />
                Payment
              </h2>

              {/* Shipping Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {shipping.fullName}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {shipping.address}, {shipping.city}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {shipping.state} - {shipping.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-trade-navy font-medium
                               hover:text-trade-gold transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-5">
                <p className="label mb-3">Payment via Razorpay</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: "💳", label: "Card"       },
                    { icon: "📱", label: "UPI"        },
                    { icon: "🏦", label: "NetBanking" },
                    { icon: "👛", label: "Wallet"     },
                    { icon: "⚡", label: "Direct Pay" },
                    { icon: "1️⃣", label: "1 Payment"  },
                  ].map((method) => (
                    <div key={method.label}
                      className="flex flex-col items-center p-3
                                 bg-gray-50 rounded-xl border
                                 border-gray-200 text-center">
                      <span className="text-2xl mb-1">{method.icon}</span>
                      <span className="text-xs text-gray-600 font-medium">
                        {method.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-xs text-gray-400
                              mb-5">
                <FiShield className="text-green-500 flex-shrink-0" />
                256-bit SSL encrypted · Secured by Razorpay
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={paying}
                className="w-full py-4 bg-trade-gold text-white
                           font-bold rounded-xl hover:bg-amber-600
                           transition-all disabled:opacity-60
                           disabled:cursor-not-allowed
                           flex items-center justify-center gap-3
                           text-lg shadow-lg shadow-amber-200"
              >
                {paying ? (
                  <>
                    <div className="h-6 w-6 rounded-full border-2
                                    border-white/30 border-t-white
                                    animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCreditCard size={20} />
                    Pay ₹{total.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-6 sticky top-24">
            <h3 className="font-display font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>

            {/* Product */}
            <div className="flex gap-3 pb-4 border-b border-gray-100 mb-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden
                              flex-shrink-0 bg-gray-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/56x56";
                    }} />
                ) : (
                  <div className="w-full h-full flex items-center
                                  justify-center">
                    <FiPackage className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm
                               line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Qty: {quantity} {product.unit}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({quantity} {product.unit})
                </span>
                <span className="font-medium">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST (18%)</span>
                <span className="font-medium">
                  ₹{tax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className={`font-medium ${
                  shipping_ === 0 ? "text-green-600" : ""
                }`}>
                  {shipping_ === 0 ? "FREE" : `₹${shipping_}`}
                </span>
              </div>
              {shipping_ === 0 && (
                <p className="text-xs text-green-600">
                  ✓ Free shipping on orders above ₹50,000
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between">
                <span className="font-display font-bold text-gray-900">
                  Total
                </span>
                <span className="font-display font-bold text-trade-navy
                                 text-xl">
                  ₹{total.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ≈ {product.price} {product.currency} (incl. GST)
              </p>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2">
              {[
                { icon: "🔒", text: "Secure Payment" },
                { icon: "📦", text: "Quality Guaranteed" },
                { icon: "↩️", text: "Easy Returns"  },
              ].map((badge) => (
                <div key={badge.text}
                  className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;