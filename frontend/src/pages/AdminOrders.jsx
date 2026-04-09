import { useState, useEffect, useCallback } from "react";
import {
  FiPackage, FiTruck, FiCheckCircle, FiXCircle,
  FiEye, FiFilter, FiDownload, FiSearch, FiClock,
  FiCreditCard, FiUser, FiMapPin,
} from "react-icons/fi";
import API from "../api/axios";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS = {
  pending: "bg-orange-100 text-orange-700",
  paid:    "bg-emerald-100 text-emerald-700",
  failed:  "bg-rose-100 text-rose-700",
};

const AdminOrders = () => {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [status,      setStatus]      = useState("");
  const [payment,     setPayment]     = useState("");
  const [updating,    setUpdating]    = useState(null);

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

  const downloadInvoice = (orderId) => {
    window.open(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/invoice`, "_blank");
  };

  if (loading && page === 1) return <Spinner text="Loading orders..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-trade-navy">
            Manage Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Track and update all trade orders from the catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Total Orders:
            </span>
            <span className="ml-2 font-bold text-trade-navy">{total}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="input-field py-2 text-sm"
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
              className="input-field py-2 text-sm"
            >
              <option value="">All Payment Types</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            {(status || payment) && (
              <button
                onClick={() => { setStatus(""); setPayment(""); setPage(1); }}
                className="text-sm text-red-500 font-medium hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-trade-light flex items-center justify-center flex-shrink-0 text-trade-navy">
                        <FiPackage size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock size={10} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.user?.name || "Deleted User"}
                      </p>
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-trade-navy uppercase">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus}
                      disabled={updating === order._id}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-trade-navy cursor-pointer transition-all ${STATUS_COLORS[order.orderStatus]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge text-[10px] font-bold uppercase tracking-wider ${PAYMENT_COLORS[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => downloadInvoice(order._id)}
                        className="p-2 text-gray-400 hover:text-trade-gold transition-colors"
                        title="Download Invoice"
                      >
                        <FiDownload size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-trade-navy transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="py-20 text-center">
              <FiPackage size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No orders found matching the criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination (Simplified) */}
      {total > 15 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-trade-navy">
            Page {page} of {Math.ceil(total / 15)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 15)}
            className="btn-secondary py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
