import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiEye, FiFilter, FiDownload, FiSearch, FiClock,
  FiCreditCard, FiUser, FiMapPin,
} from "react-icons/fi";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:   { bg: "rgba(234,179,8,0.15)",   color: "#facc15", border: "rgba(234,179,8,0.3)" },
  confirmed: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  shipped:   { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  delivered: { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  cancelled: { bg: "rgba(239,68,68,0.15)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

const PAYMENT_COLORS = {
  pending: { bg: "rgba(249,115,22,0.15)",  color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  paid:    { bg: "rgba(34,197,94,0.15)",   color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  failed:  { bg: "rgba(244,63,94,0.15)",   color: "#fb7185", border: "rgba(244,63,94,0.3)" },
};

const PARTICLE_COUNT = 30;

const AdminOrders = () => {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [status,      setStatus]      = useState("");
  const [payment,     setPayment]     = useState("");
  const [updating,    setUpdating]    = useState(null);
  const particleRef   = useRef(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (status)  params.status = status;
      if (payment) params.paymentStatus = payment;

      const { data } = await API.get("/orders", { params });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, status, payment]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Particles setup ──
  useEffect(() => {
    const wrap = particleRef.current;
    if (!wrap) return;
    wrap.innerHTML = "";
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const d = document.createElement("div");
      d.style.cssText = `
        position:absolute;
        width:4px;height:4px;border-radius:50%;
        background:#3b82f6;opacity:0;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 50}%;
        animation:dotRise ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay:${Math.random() * 8}s;
      `;
      wrap.appendChild(d);
    }
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

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

  if (loading && page === 1) return (
    <div className="flex items-center justify-center py-20 min-h-screen" style={{ background:"#0a1628" }}>
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-trade-navy animate-spin" />
    </div>
  );

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
        .dark-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .dark-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
        }
        select.dark-input option {
          background: #0f172a;
          color: #fff;
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#0a1628" }}>
        
        {/* Animated orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width:500, height:500, background:"#3b82f6", filter:"blur(80px)", opacity:0.1, top:"-100px", right:"-100px", animation:"orbFloat 12s ease-in-out infinite" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width:400, height:400, background:"#8b5cf6", filter:"blur(80px)", opacity:0.06, bottom:"10%", left:"-100px", animation:"orbFloat 12s ease-in-out infinite", animationDelay:"4s" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        {/* Particles */}
        <div ref={particleRef} className="absolute inset-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{ animation:"cardIn 0.5s both" }}>
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-bold text-3xl text-white" style={{ fontFamily:"Poppins,sans-serif" }}>
                Manage Orders
              </h1>
              <p className="mt-1" style={{ color:"rgba(255,255,255,0.6)" }}>
                Track and update all trade orders from the catalog
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl px-4 py-2 shadow-sm flex items-center justify-center gap-2"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(10px)" }}>
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.5)" }}>
                  Total Orders:
                </span>
                <span className="font-bold text-lg text-blue-400">{total}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl shadow-sm p-6 mb-8"
               style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <FiFilter style={{ color:"rgba(255,255,255,0.4)" }} />
                <span className="text-sm font-bold text-white tracking-wider">FILTERS:</span>
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="dark-input font-bold"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={payment}
                  onChange={(e) => { setPayment(e.target.value); setPage(1); }}
                  className="dark-input font-bold"
                >
                  <option value="">All Payment Types</option>
                  <option value="pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>

                {(status || payment) && (
                  <button
                    onClick={() => { setStatus(""); setPayment(""); setPage(1); }}
                    className="text-sm font-bold transition-colors"
                    style={{ color:"#f87171" }}
                    onMouseEnter={e => e.currentTarget.style.color="#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color="#f87171"}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl shadow-sm overflow-hidden mb-8"
               style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(15px)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background:"rgba(0,0,0,0.2)", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Customer
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Payment
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color:"rgba(255,255,255,0.4)" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  {orders.map((order) => {
                    const statusStyle = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.pending;
                    const paymentStyle = PAYMENT_COLORS[order.paymentStatus] || PAYMENT_COLORS.pending;

                    return (
                    <tr key={order._id} className="transition-colors border-b"
                        style={{ borderBottomColor:"rgba(255,255,255,0.05)" }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                            <FiPackage size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              #{order.orderNumber}
                            </p>
                            <p className="text-xs flex items-center gap-1 font-medium mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                              <FiClock size={10} />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-white">
                            {order.user?.name || "Deleted User"}
                          </p>
                          <p className="text-xs font-medium mt-1" style={{ color:"rgba(255,255,255,0.5)" }}>{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="text-sm font-bold uppercase text-blue-400">
                            {order.totalAmount.toLocaleString()} {order.currency}
                          </p>
                          <p className="text-xs font-medium mt-1" style={{ color:"rgba(255,255,255,0.4)" }}>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          disabled={updating === order._id}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="text-[10px] font-bold px-2 py-1 rounded border outline-none cursor-pointer uppercase tracking-wider transition-all"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.border,
                            appearance: "none",
                            paddingRight: "0.5rem"
                          }}
                        >
                          <option value="pending" style={{ background:"#0f172a", color:"#fff" }}>Pending</option>
                          <option value="confirmed" style={{ background:"#0f172a", color:"#fff" }}>Confirmed</option>
                          <option value="shipped" style={{ background:"#0f172a", color:"#fff" }}>Shipped</option>
                          <option value="delivered" style={{ background:"#0f172a", color:"#fff" }}>Delivered</option>
                          <option value="cancelled" style={{ background:"#0f172a", color:"#fff" }}>Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{ background: paymentStyle.bg, color: paymentStyle.color, border: `1px solid ${paymentStyle.border}` }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button
                            onClick={() => downloadInvoice(order._id, order.orderNumber)}
                            className="p-2 transition-colors rounded-lg"
                            title="Download Invoice"
                            style={{ color:"#f59e0b" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(245,158,11,0.1)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
                          >
                            <FiDownload size={16} />
                          </button>
                          <button
                            className="p-2 transition-colors rounded-lg"
                            title="View Details"
                            style={{ color:"#60a5fa" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor="rgba(59,130,246,0.1)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor="transparent"}
                          >
                            <FiEye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="py-20 text-center">
                  <FiPackage size={48} className="mx-auto mb-4" style={{ color:"rgba(255,255,255,0.2)" }} />
                  <p className="font-medium" style={{ color:"rgba(255,255,255,0.5)" }}>No orders found matching the criteria</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
                style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)" }}
                onMouseEnter={e => { if(page!==1) e.currentTarget.style.background="rgba(255,255,255,0.1)"}}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >
                Previous
              </button>
              <span className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.3)" }}>
                Page {page} of {Math.ceil(total / 15)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 15)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
                style={{ background:"rgba(255,255,255,0.06)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)" }}
                onMouseEnter={e => { if(page < Math.ceil(total/15)) e.currentTarget.style.background="rgba(255,255,255,0.1)"}}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
