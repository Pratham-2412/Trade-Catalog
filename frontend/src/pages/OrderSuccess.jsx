import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiCheckCircle, FiDownload, FiPackage,
  FiMapPin, FiClock, FiHome, FiList,
} from "react-icons/fi";
import { getOrderById } from "../api/orders";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 28;

const OrderSuccess = () => {
  const { orderId }          = useParams();
  const [order,  setOrder]   = useState(null);
  const [loading,setLoading] = useState(true);
  const particleRef = useRef(null);

  useEffect(() => {
    getOrderById(orderId)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

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
        background:#10b981;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 40}%;
        animation:dotRise ${4 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 6}s;
      `;
      wrap.appendChild(d);
    }
  }, [loading]);

  const downloadInvoice = async () => {
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${order?.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to download invoice");
    }
  };

  if (loading) return <Spinner text="Loading order..." />;

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
        @keyframes iconPulse {
          0%,100% { box-shadow:0 0 18px rgba(16,185,129,0.45),0 4px 14px rgba(0,0,0,0.3); }
          50%     { box-shadow:0 0 32px rgba(16,185,129,0.75),0 4px 20px rgba(0,0,0,0.4); }
        }
        @keyframes btnShimmer {
          0%,100% { transform:translateX(-100%); }
          60%     { transform:translateX(100%); }
        }
      `}</style>
      
      <div
        className="min-h-screen py-10 flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: "#0a1628" }}
      >
        {/* Animated orbs (Greenish theme for success) */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:420, height:420, background:"#10b981", filter:"blur(72px)", opacity:0.14, top:"-130px", right:"-90px", animation:"orbFloat 8s ease-in-out infinite" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:320, height:320, background:"#3b82f6", filter:"blur(72px)", opacity:0.16, bottom:"-90px", left:"-70px", animation:"orbFloat 8s ease-in-out infinite", animationDelay:"3s" }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width:200, height:200, background:"#10b981", filter:"blur(60px)", opacity:0.10, bottom:"80px", right:"60px", animation:"orbFloat 8s ease-in-out infinite", animationDelay:"5s" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }}
        />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl" style={{ animation:"cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div
                className="p-3 rounded-full flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#065f46,#10b981)", animation:"iconPulse 3s ease-in-out infinite" }}
              >
                <FiCheckCircle className="text-white text-3xl animate-bounce" style={{ animationDuration: "2s" }} />
              </div>
            </div>
            <h1 className="font-bold text-3xl text-white mb-2" style={{ fontFamily:"Poppins,sans-serif" }}>
              Order Confirmed! 🎉
            </h1>
            <p className="text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
              Thank you for your order. We'll process it soon.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(16,185,129,0.08),0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.07)",
              backdropFilter:"blur(20px)",
            }}
          >
            {order && (
              <>
                <div
                  className="p-6 text-white"
                  style={{ background:"linear-gradient(to right, rgba(30,58,138,0.5), rgba(30,58,138,0.8))" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm mb-1" style={{ color:"rgba(255,255,255,0.6)" }}>Order Number</p>
                      <p className="font-bold text-2xl" style={{ fontFamily:"Poppins,sans-serif" }}>
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm mb-1" style={{ color:"rgba(255,255,255,0.6)" }}>Total Paid</p>
                      <p className="font-bold text-2xl" style={{ fontFamily:"Poppins,sans-serif" }}>
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)" }}
                  >
                    <FiCheckCircle className="text-green-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-green-300">
                        Payment Successful
                      </p>
                      <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>
                        Payment ID: {order.razorpayPaymentId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                      <FiPackage style={{ color:"#f59e0b" }} />
                      Items Ordered
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background:"rgba(255,255,255,0.04)" }}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                            {item.productImage ? (
                              <img src={item.productImage} alt={item.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/48x48";
                                }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
                              {item.quantity} {item.unit} × ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-sm flex-shrink-0 text-green-400">
                            ₹{item.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                      <FiMapPin style={{ color:"#f59e0b" }} />
                      Shipping To
                    </h3>
                    <div className="p-3 rounded-xl text-sm" style={{ background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.7)" }}>
                      <p className="font-medium text-white mb-1">
                        {order.shippingAddress.fullName}
                      </p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                      <p className="mt-1">{order.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
                    <div className="space-y-1.5 text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-white">₹{order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%)</span>
                        <span className="text-white">₹{order.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-white">
                          {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t text-base mt-2" style={{ borderColor:"rgba(255,255,255,0.1)" }}>
                        <span className="text-white">Total Paid</span>
                        <span className="text-green-400">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm rounded-xl p-3" style={{ background:"rgba(59,130,246,0.1)", color:"rgba(255,255,255,0.7)" }}>
                    <FiClock className="text-blue-400 flex-shrink-0" />
                    <span>
                      Expected delivery:{" "}
                      <strong className="text-white">
                        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                          day:   "numeric",
                          month: "long",
                          year:  "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadInvoice}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl relative overflow-hidden"
              style={{
                background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", fontFamily:"Poppins,sans-serif", fontSize:"0.95rem", border:"none",
                cursor: "pointer", boxShadow:"0 4px 20px rgba(59,130,246,0.35)", transition:"transform 0.15s,box-shadow 0.2s",
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
              <FiDownload size={16} />
              Download Invoice
            </button>
            <Link
              to="/my-orders"
              className="flex-1 flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-colors"
              style={{ background:"rgba(255,255,255,0.1)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}
            >
              <FiList size={16} />
              My Orders
            </Link>
            <Link
              to="/products"
              className="flex-1 flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-colors"
              style={{ background:"transparent", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.2)" }}
              onMouseEnter={e => e.currentTarget.style.color="#fff"}
              onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.7)"}
            >
              <FiHome size={16} />
              Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;