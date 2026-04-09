import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPackage, FiDownload, FiEye,
  FiClock, FiCheckCircle, FiXCircle,
  FiTruck,
} from "react-icons/fi";
import { getMyOrders } from "../api/orders";
import Spinner from "../components/Spinner";

const StatusBadge = ({ status }) => {
  const styles = {
    pending:    "bg-yellow-100 text-yellow-700",
    confirmed:  "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped:    "bg-orange-100 text-orange-700",
    delivered:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
  };
  const icons = {
    pending:    <FiClock size={11} />,
    confirmed:  <FiCheckCircle size={11} />,
    processing: <FiPackage size={11} />,
    shipped:    <FiTruck size={11} />,
    delivered:  <FiCheckCircle size={11} />,
    cancelled:  <FiXCircle size={11} />,
  };
  return (
    <span className={`badge flex items-center gap-1 capitalize
                      ${styles[status] || styles.pending}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const styles = {
    paid:     "bg-green-100 text-green-700",
    pending:  "bg-yellow-100 text-yellow-700",
    failed:   "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`badge capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

const MyOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

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

  if (loading) return <Spinner text="Loading orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-trade-navy">
          My Orders
        </h1>
        <p className="text-gray-500 mt-1">
          {total} order{total !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl
                        border border-gray-100">
          <FiPackage className="text-gray-200 text-7xl mx-auto mb-4" />
          <h3 className="font-display font-semibold text-gray-400
                         text-xl mb-2">
            No orders yet
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            Start shopping to see your orders here
          </p>
          <Link to="/" className="btn-primary text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id}
              className="bg-white rounded-2xl border border-gray-100
                         shadow-sm overflow-hidden hover:shadow-md
                         transition-shadow">

              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between
                              gap-3 p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      Order Number
                    </p>
                    <p className="font-bold text-trade-navy">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-700">
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
                  <div key={i}
                    className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden
                                    bg-gray-100 flex-shrink-0">
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
                        <div className="w-full h-full flex items-center
                                        justify-center">
                          <FiPackage className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm
                                     truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} {item.unit} ×
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-trade-navy text-sm
                                   flex-shrink-0">
                      ₹{item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg
                                  flex items-center gap-2 text-xs
                                  text-blue-700">
                    <FiTruck size={12} />
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </div>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex flex-wrap items-center justify-between
                              gap-3 p-4 border-t border-gray-100">
                <div>
                  <span className="text-sm text-gray-500">Total: </span>
                  <span className="font-bold text-trade-navy text-lg">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/api/orders/${order._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2
                               bg-trade-navy text-white text-xs
                               rounded-lg hover:bg-blue-800
                               transition-colors font-medium"
                  >
                    <FiDownload size={12} />
                    Invoice
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;