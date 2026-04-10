import { useState, useEffect, useRef } from "react";
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

const PARTICLE_COUNT = 30;

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
    <div className="flex items-center justify-center mb-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all`}
               style={{
                 background: current >= step.id ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.08)",
                 color: current >= step.id ? "#fff" : "rgba(255,255,255,0.4)",
                 boxShadow: current >= step.id ? "0 0 15px rgba(245,158,11,0.4)" : "none"
               }}>
            {current > step.id
              ? <FiCheck size={16} />
              : step.id
            }
          </div>
          <span className="ml-2 text-sm font-medium hidden sm:block"
                style={{ color: current >= step.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className="w-12 sm:w-20 h-0.5 mx-3 transition-all"
                 style={{ background: current > step.id ? "#f59e0b" : "rgba(255,255,255,0.1)" }} />
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
  const particleRef = useRef(null);

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
          color:        "#0a1628",
          backdrop_color: "rgba(0,0,0,0.8)",
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

  const inputStyle = {
    width:"100%",padding:"0.65rem 1rem", background:"rgba(255,255,255,0.07)",
    border:"1px solid rgba(255,255,255,0.12)",
    borderRadius:10,color:"#fff",fontSize:"0.87rem",outline:"none", transition:"border-color 0.25s,box-shadow 0.25s"
  };
  const inputFocus = e => { e.target.style.boxShadow="0 0 0 3px rgba(59,130,246,0.15)"; e.target.style.borderColor="rgba(59,130,246,0.55)"; };
  const inputBlur = e => { e.target.style.boxShadow="none"; e.target.style.borderColor="rgba(255,255,255,0.12)"; };

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
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:450, height:450, background:"#3b82f6", filter:"blur(72px)", opacity:0.12, top:"-50px", right:"-100px", animation:"orbFloat 10s ease-in-out infinite" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:350, height:350, background:"#f59e0b", filter:"blur(72px)", opacity:0.08, bottom:"-50px", left:"-100px", animation:"orbFloat 10s ease-in-out infinite", animationDelay:"3s" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:250, height:250, background:"#1e40af", filter:"blur(60px)", opacity:0.08, bottom:"20%", right:"10%", animation:"orbFloat 10s ease-in-out infinite", animationDelay:"5s" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }}
        />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
              className="flex items-center gap-2 text-sm font-medium transition-colors mb-4"
              style={{ color:"rgba(255,255,255,0.5)" }}
              onMouseEnter={e => e.currentTarget.style.color="#fff"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.5)"}
            >
              <FiArrowLeft size={16} />
              {step === 1 ? "Back to Product" : "Previous Step"}
            </button>
            <h1 className="font-bold text-3xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
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
                <div
                  className="rounded-2xl p-6"
                  style={{ animation:"cardIn 0.5s both", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}
                >
                  <h2 className="font-semibold text-xl text-white mb-5 flex items-center gap-2" style={{ fontFamily:"Poppins,sans-serif" }}>
                    <FiPackage style={{ color:"#f59e0b" }} />
                    Product Details
                  </h2>

                  {/* Product Card */}
                  <div className="flex gap-4 p-4 rounded-xl mb-6 items-center" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/80x80";
                          }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-gray-500 text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-base truncate" style={{ fontFamily:"Poppins,sans-serif" }}>
                        {product.name}
                      </h3>
                      <p className="text-sm mt-0.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                        {product.category}
                      </p>
                      <p className="text-sm mt-0.5" style={{ color:"rgba(255,255,255,0.4)" }}>
                        Origin: {product.origin || "N/A"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-blue-400">
                        ₹{priceINR.toLocaleString()}
                      </p>
                      <p className="text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>per {product.unit}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="mb-5">
                    <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                      Quantity ({product.unit})
                      <span className="font-normal ml-2 text-xs" style={{ color:"rgba(255,255,255,0.4)" }}>
                        Min: {product.minOrderQuantity}
                        {product.maxOrderQuantity > 0 && ` · Max: ${product.maxOrderQuantity}`}
                      </span>
                    </label>
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor:"rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.03)" }}>
                        <button
                          onClick={() => setQuantity(Math.max(product.minOrderQuantity, quantity - 1))}
                          className="px-4 py-3 font-medium transition-colors text-lg"
                          style={{ color:"rgba(255,255,255,0.6)", background:"transparent" }}
                          onMouseEnter={e => e.target.style.background="rgba(255,255,255,0.08)"}
                          onMouseLeave={e => e.target.style.background="transparent"}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.max(product.minOrderQuantity, val));
                          }}
                          className="w-20 text-center py-3 border-x focus:outline-none font-bold"
                          style={{ background:"transparent", color:"#fff", borderColor:"rgba(255,255,255,0.15)" }}
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-3 font-medium transition-colors text-lg"
                          style={{ color:"rgba(255,255,255,0.6)", background:"transparent" }}
                          onMouseEnter={e => e.target.style.background="rgba(255,255,255,0.08)"}
                          onMouseLeave={e => e.target.style.background="transparent"}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm mt-2 sm:mt-0" style={{ color:"rgba(255,255,255,0.6)" }}>
                        {quantity} {product.unit} × ₹{priceINR.toLocaleString()} =
                        <span className="font-bold ml-1 text-blue-400">
                          ₹{subtotal.toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>
                      Special Instructions
                      <span className="font-normal ml-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any special requirements..."
                      style={{ ...inputStyle, resize:"none" }}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                      background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", fontFamily:"Poppins,sans-serif", border:"none", cursor:"pointer",
                      boxShadow:"0 4px 20px rgba(59,130,246,0.35)", transition:"transform 0.15s,box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform="translateY(-1px)";
                      e.currentTarget.style.boxShadow="0 6px 28px rgba(59,130,246,0.5)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform="translateY(0)";
                      e.currentTarget.style.boxShadow="0 4px 20px rgba(59,130,246,0.35)";
                    }}
                  >
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }}
                    />
                    Continue to Shipping →
                  </button>
                </div>
              )}

              {/* STEP 2 — Shipping Address */}
              {step === 2 && (
                <div
                  className="rounded-2xl p-6"
                  style={{ animation:"cardIn 0.5s both", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}
                >
                  <h2 className="font-semibold text-xl text-white mb-5 flex items-center gap-2" style={{ fontFamily:"Poppins,sans-serif" }}>
                    <FiMapPin style={{ color:"#f59e0b" }} />
                    Shipping Address
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Full Name *</label>
                        <input
                          name="fullName"
                          value={shipping.fullName}
                          onChange={handleShippingChange}
                          placeholder="Pratham Shah"
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Email *</label>
                        <input
                          name="email"
                          type="email"
                          value={shipping.email}
                          onChange={handleShippingChange}
                          placeholder="you@example.com"
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Phone *</label>
                        <input
                          name="phone"
                          value={shipping.phone}
                          onChange={handleShippingChange}
                          placeholder="10 digit number"
                          maxLength={10}
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Company</label>
                        <input
                          name="company"
                          value={shipping.company}
                          onChange={handleShippingChange}
                          placeholder="Your company name"
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Full Address *</label>
                      <textarea
                        name="address"
                        value={shipping.address}
                        onChange={handleShippingChange}
                        placeholder="House/Flat No, Street, Area"
                        rows={2}
                        style={{ ...inputStyle, resize:"none" }}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>City *</label>
                        <input
                          name="city"
                          value={shipping.city}
                          onChange={handleShippingChange}
                          placeholder="Ahmedabad"
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>State *</label>
                        <select
                          name="state"
                          value={shipping.state}
                          onChange={handleShippingChange}
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} style={{ color:"#000" }}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Pincode *</label>
                        <input
                          name="pincode"
                          value={shipping.pincode}
                          onChange={handleShippingChange}
                          placeholder="380001"
                          maxLength={6}
                          style={inputStyle}
                          onFocus={inputFocus} onBlur={inputBlur}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color:"rgba(255,255,255,0.6)" }}>Country</label>
                      <input
                        name="country"
                        value={shipping.country}
                        onChange={handleShippingChange}
                        style={inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => { if (validateShipping()) setStep(3); }}
                    className="w-full mt-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                      background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", fontFamily:"Poppins,sans-serif", border:"none", cursor:"pointer",
                      boxShadow:"0 4px 20px rgba(59,130,246,0.35)", transition:"transform 0.15s,box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform="translateY(-1px)";
                      e.currentTarget.style.boxShadow="0 6px 28px rgba(59,130,246,0.5)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform="translateY(0)";
                      e.currentTarget.style.boxShadow="0 4px 20px rgba(59,130,246,0.35)";
                    }}
                  >
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }}
                    />
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* STEP 3 — Payment */}
              {step === 3 && (
                <div
                  className="rounded-2xl p-6"
                  style={{ animation:"cardIn 0.5s both", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}
                >
                  <h2 className="font-semibold text-xl text-white mb-5 flex items-center gap-2" style={{ fontFamily:"Poppins,sans-serif" }}>
                    <FiCreditCard style={{ color:"#f59e0b" }} />
                    Payment
                  </h2>

                  {/* Shipping Summary */}
                  <div className="rounded-xl p-4 mb-5" style={{ background:"rgba(255,255,255,0.04)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-white">
                          {shipping.fullName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>
                          {shipping.address}, {shipping.city}
                        </p>
                        <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
                          {shipping.state} - {shipping.pincode}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="text-xs font-medium transition-colors"
                        style={{ color:"#60a5fa" }}
                        onMouseEnter={e => e.target.style.color="#3b82f6"}
                        onMouseLeave={e => e.target.style.color="#60a5fa"}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-5">
                    <p className="text-xs font-medium mb-3" style={{ color:"rgba(255,255,255,0.6)" }}>Payment via Razorpay</p>
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
                          className="flex flex-col items-center p-3 rounded-xl text-center"
                          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}
                        >
                          <span className="text-2xl mb-1">{method.icon}</span>
                          <span className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.7)" }}>
                            {method.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 text-xs mb-5" style={{ color:"rgba(255,255,255,0.4)" }}>
                    <FiShield className="text-green-400 flex-shrink-0" />
                    256-bit SSL encrypted · Secured by Razorpay
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full py-4 font-bold rounded-xl flex items-center justify-center gap-3 text-lg relative overflow-hidden"
                    style={{
                      background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none",
                      cursor: paying ? "not-allowed" : "pointer", opacity: paying ? 0.6 : 1,
                      boxShadow:"0 6px 20px rgba(245,158,11,0.4)", transition:"transform 0.15s,box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      if (!paying) {
                        e.currentTarget.style.transform="translateY(-1px)";
                        e.currentTarget.style.boxShadow="0 8px 25px rgba(245,158,11,0.55)";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform="translateY(0)";
                      e.currentTarget.style.boxShadow="0 6px 20px rgba(245,158,11,0.4)";
                    }}
                  >
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }}
                    />
                    {paying ? (
                      <>
                        <div className="h-6 w-6 rounded-full border-2 animate-spin" style={{ borderColor:"rgba(255,255,255,0.3)", borderTopColor:"#fff" }} />
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
              <div
                className="rounded-2xl p-6 sticky top-24"
                style={{ animation:"cardIn 0.5s both", animationDelay:"0.1s", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}
              >
                <h3 className="font-semibold text-white mb-4" style={{ fontFamily:"Poppins,sans-serif" }}>
                  Order Summary
                </h3>

                {/* Product */}
                <div className="flex gap-3 pb-4 mb-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/56x56";
                        }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>
                      Qty: {quantity} {product.unit}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 mb-4" style={{ color:"rgba(255,255,255,0.7)" }}>
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({quantity} {product.unit})
                    </span>
                    <span className="font-medium text-white">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span className="font-medium text-white">
                      ₹{tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={`font-medium ${
                      shipping_ === 0 ? "text-green-400" : "text-white"
                    }`}>
                      {shipping_ === 0 ? "FREE" : `₹${shipping_}`}
                    </span>
                  </div>
                  {shipping_ === 0 && (
                    <p className="text-xs text-green-400">
                      ✓ Free shipping on orders above ₹50,000
                    </p>
                  )}
                </div>

                <div className="pt-4 mb-4" style={{ borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex justify-between">
                    <span className="font-bold text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                      Total
                    </span>
                    <span className="font-bold text-xl text-blue-400" style={{ fontFamily:"Poppins,sans-serif" }}>
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
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
                      className="flex items-center gap-2 text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
                      <span>{badge.icon}</span>
                      {badge.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;