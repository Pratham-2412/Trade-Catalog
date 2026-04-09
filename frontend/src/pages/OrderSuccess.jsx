import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiCheckCircle, FiDownload, FiPackage,
  FiMapPin, FiClock, FiHome, FiList,
} from "react-icons/fi";
import { getOrderById } from "../api/orders";
import Spinner from "../components/Spinner";

const OrderSuccess = () => {
  const { orderId }          = useParams();
  const [order,  setOrder]   = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    getOrderById(orderId)
      .then(({ data }) => setOrder(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <Spinner text="Loading order..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex
                        items-center justify-center mx-auto mb-4
                        animate-bounce">
          <FiCheckCircle className="text-green-500 text-4xl" />
        </div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
          Order Confirmed! 🎉
        </h1>
        <p className="text-gray-500">
          Thank you for your order. We'll process it soon.
        </p>
      </div>

      {/* Order Card */}
      {order && (
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm overflow-hidden mb-6">

          {/* Order Number */}
          <div className="bg-gradient-to-r from-trade-navy to-blue-800
                          p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">Order Number</p>
                <p className="font-display font-bold text-2xl">
                  #{order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-sm mb-1">Total Paid</p>
                <p className="font-display font-bold text-2xl">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Status */}
            <div className="flex items-center gap-3 p-3 bg-green-50
                            rounded-xl border border-green-100">
              <FiCheckCircle className="text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800 text-sm">
                  Payment Successful
                </p>
                <p className="text-green-600 text-xs mt-0.5">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3
                             flex items-center gap-2">
                <FiPackage className="text-trade-gold" />
                Items Ordered
              </h3>
              {order.items.map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 p-3 bg-gray-50
                             rounded-xl">
                  <div className="w-12 h-12 rounded-lg overflow-hidden
                                  bg-gray-200 flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/48x48";
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
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3
                             flex items-center gap-2">
                <FiMapPin className="text-trade-gold" />
                Shipping To
              </h3>
              <div className="p-3 bg-gray-50 rounded-xl text-sm
                              text-gray-600">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (18%)</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCost === 0
                      ? "FREE"
                      : `₹${order.shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold
                                text-gray-900 pt-2 border-t
                                border-gray-100 text-base">
                  <span>Total Paid</span>
                  <span className="text-trade-navy">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Delivery */}
            <div className="flex items-center gap-2 text-sm text-gray-500
                            bg-blue-50 rounded-xl p-3">
              <FiClock className="text-blue-500 flex-shrink-0" />
              <span>
                Expected delivery:{" "}
                <strong className="text-gray-900">
                  {new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-IN", {
                    day:   "numeric",
                    month: "long",
                    year:  "numeric",
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`/api/orders/${orderId}/invoice`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2
                     bg-trade-navy text-white py-3 rounded-xl
                     font-medium hover:bg-blue-800 transition-colors"
        >
          <FiDownload size={16} />
          Download Invoice
        </a>
        <Link
          to="/my-orders"
          className="flex-1 flex items-center justify-center gap-2
                     border-2 border-trade-navy text-trade-navy py-3
                     rounded-xl font-medium hover:bg-trade-navy
                     hover:text-white transition-colors"
        >
          <FiList size={16} />
          My Orders
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2
                     border-2 border-gray-200 text-gray-600 py-3
                     rounded-xl font-medium hover:border-gray-400
                     transition-colors"
        >
          <FiHome size={16} />
          Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;