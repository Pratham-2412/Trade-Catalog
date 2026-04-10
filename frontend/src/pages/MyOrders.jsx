import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage, FiDownload, FiEye,
  FiClock, FiCheckCircle, FiXCircle,
  FiTruck,
} from "react-icons/fi";
import { getMyOrders } from "../api/orders";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const PARTICLE_COUNT = 30;

const StatusBadge = ({ status }) => {
  const styles = {
    pending:    { bg: "rgba(234,179,8,0.15)",   color: "#facc15", border: "rgba(234,179,8,0.3)" },
    confirmed:  { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
    processing: { bg: "rgba(168,85,247,0.15)",  color: "#c084fc", border: "rgba(168,85,247,0.3)" },
    shipped:    { bg: "rgba(249,115,22,0.15)",  color: "#fb923c", border: "rgba(249,115,22,0.3)" },
    delivered:  { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    cancelled:  { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
  };
  const icons = {
    pending:    <FiClock size={11} />,
    confirmed:  <FiCheckCircle size={11} />,
    processing: <FiPackage size={11} />,
    shipped:    <FiTruck size={11} />,
    delivered:  <FiCheckCircle size={11} />,
    cancelled:  <FiXCircle size={11} />,
  };
  const theme = styles[status] || styles.pending;
  
  return (
    <span className="flex items-center gap-1 capitalize px-2 py-1 rounded-md text-[10px] font-bold tracking-wide"
          style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}>
      {icons[status]}
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const styles = {
    paid:     { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
    pending:  { bg: "rgba(234,179,8,0.15)",   color: "#facc15", border: "rgba(234,179,8,0.3)" },
    failed:   { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
    refunded: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af", border: "rgba(156,163,175,0.3)" },
  };
  const theme = styles[status] || styles.pending;

  return (
    <span className="capitalize px-2 py-1 rounded-md text-[10px] font-bold tracking-wide"
          style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}>
      {status}
    </span>
  );
};

const MyOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const particleRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getMyOrders({ page, limit: 10 });
        setOrders(data.orders);
        setTotal(data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

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

  const downloadInvoice = async (orderId, orderNumber) => {
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error(error.message || "Failed to download invoice");
    }
  };

  if (loading) return <Spinner text="Loading orders..." />;

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

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }}
        />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10" style={{ animation:"cardIn 0.5s both" }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
              My Orders
            </h1>
            <p className="mt-1" style={{ color:"rgba(255,255,255,0.6)" }}>
              {total} order{total !== 1 ? "s" : ""} placed
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-20 rounded-2xl"
                 style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)" }}>
              <FiPackage className="text-6xl mx-auto mb-4" style={{ color:"rgba(255,255,255,0.2)" }} />
              <h3 className="font-semibold text-xl mb-2 text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                No orders yet
              </h3>
              <p className="text-sm mb-5" style={{ color:"rgba(255,255,255,0.5)" }}>
                Start shopping to see your orders here
              </p>
              <Link to="/products" className="inline-block py-2.5 px-6 font-bold rounded-xl relative overflow-hidden"
                    style={{
                      background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", border:"none",
                      boxShadow:"0 4px 15px rgba(59,130,246,0.35)", transition:"transform 0.15s"
                    }}>
                <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order, index) => (
                <div key={order._id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(15px)",
                    animationDelay:`${index * 0.1}s`, animation:"cardIn 0.5s both"
                  }}>

                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4"
                       style={{ background:"rgba(0,0,0,0.2)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>
                          Order Number
                        </p>
                        <p className="font-bold text-white tracking-wide" style={{ fontFamily:"Poppins,sans-serif" }}>
                          #{order.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>Date</p>
                        <p className="font-medium text-white text-sm tracking-wide">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge  status={order.orderStatus}   />
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/48x48";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate tracking-wide">
                            {item.productName}
                          </p>
                          <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
                            {item.quantity} {item.unit} × ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0 text-blue-400">
                          ₹{item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    ))}

                    {/* Tracking */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-2.5 rounded-lg flex items-center gap-2 text-xs"
                           style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.2)" }}>
                        <FiTruck size={14} />
                        Tracking ID: <strong className="text-blue-300 tracking-wider w-full">{order.trackingNumber}</strong>
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4"
                       style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <span className="text-sm" style={{ color:"rgba(255,255,255,0.6)" }}>Total: </span>
                      <span className="font-bold text-white text-lg">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadInvoice(order._id, order.orderNumber)}
                        className="flex items-center gap-1.5 px-4 py-2 font-bold rounded-lg relative overflow-hidden text-xs uppercase tracking-wider"
                        style={{
                          background:"linear-gradient(135deg,#3b82f6,#1e40af)", color:"#fff", border:"none", cursor:"pointer",
                          boxShadow:"0 2px 10px rgba(59,130,246,0.3)", transition:"transform 0.15s, box-shadow 0.2s"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform="translateY(-1px)";
                          e.currentTarget.style.boxShadow="0 4px 15px rgba(59,130,246,0.4)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform="translateY(0)";
                          e.currentTarget.style.boxShadow="0 2px 10px rgba(59,130,246,0.3)";
                        }}
                      >
                        <span className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(105deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.18) 50%,rgba(255,255,255,0) 60%)", animation:"btnShimmer 3s ease-in-out infinite" }} />
                        <FiDownload size={13} />
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;