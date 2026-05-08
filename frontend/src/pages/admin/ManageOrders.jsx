import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../services/imageHelper";

// Status badge colors
const statusColors = {
  PENDING: "bg-yellow-900 text-yellow-300 border border-yellow-700",
  CONFIRMED: "bg-blue-900 text-blue-300 border border-blue-700",
  DELIVERED: "bg-green-900 text-green-300 border border-green-700",
};

// Status emoji
const statusEmoji = {
  PENDING: "⏳",
  CONFIRMED: "📦",
  DELIVERED: "✅",
};

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null); // konsa order update ho raha hai

  // Page load hote hi orders fetch karo
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // GET /api/admin/orders — ADMIN JWT required
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Order status update karo
  // -----------------------------------------------
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);

    try {
      // PUT /api/admin/orders/{id}/status
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
      });

      // Local state update karo — page reload ki zaroorat nahi
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: res.data.status } : order,
        ),
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // -----------------------------------------------
  // LOADING
  // -----------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-purple-600 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // ERROR
  // -----------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-purple-600 hover:bg-purple-700 text-white
                       px-6 py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // MAIN PAGE
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Manage Orders
            </h1>
            <p className="text-gray-400 text-sm">
              {orders.length} total order{orders.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Back to dashboard */}
          <Link
            to="/admin"
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Pending count */}
          <div className="bg-gray-800 rounded-xl border border-yellow-800 p-4 text-center">
            <p className="text-3xl font-bold text-yellow-300">
              {orders.filter((o) => o.status === "PENDING").length}
            </p>
            <p className="text-yellow-600 text-xs mt-1">⏳ Pending</p>
          </div>

          {/* Confirmed count */}
          <div className="bg-gray-800 rounded-xl border border-blue-800 p-4 text-center">
            <p className="text-3xl font-bold text-blue-300">
              {orders.filter((o) => o.status === "CONFIRMED").length}
            </p>
            <p className="text-blue-600 text-xs mt-1">📦 Confirmed</p>
          </div>

          {/* Delivered count */}
          <div className="bg-gray-800 rounded-xl border border-green-800 p-4 text-center">
            <p className="text-3xl font-bold text-green-300">
              {orders.filter((o) => o.status === "DELIVERED").length}
            </p>
            <p className="text-green-600 text-xs mt-1">✅ Delivered</p>
          </div>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📋</p>
            <p className="text-white text-xl font-semibold mb-2">
              No orders yet
            </p>
            <p className="text-gray-400">
              Orders will appear here when customers place them
            </p>
          </div>
        )}

        {/* ---- ORDERS LIST ---- */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
            >
              {/* Order header row */}
              <div
                className="flex flex-wrap items-center justify-between
                              gap-4 px-6 py-4 border-b border-gray-700"
              >
                {/* Left: Order info */}
                <div className="flex items-center gap-6">
                  {/* Order ID */}
                  <div>
                    <p className="text-gray-400 text-xs">Order ID</p>
                    <p className="text-white font-bold">#{order.id}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-gray-400 text-xs">Date</p>
                    <p className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="text-purple-400 font-bold">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Items count */}
                  <div className="hidden sm:block">
                    <p className="text-gray-400 text-xs">Items</p>
                    <p className="text-white text-sm">
                      {order.orderItems?.length}
                    </p>
                  </div>
                </div>

                {/* Right: Status badge + dropdown */}
                <div className="flex items-center gap-3">
                  {/* Current status badge */}
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full
                                   ${
                                     statusColors[order.status] ||
                                     "bg-gray-700 text-gray-300"
                                   }`}
                  >
                    {statusEmoji[order.status]} {order.status}
                  </span>

                  {/* Status update dropdown */}
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order.id, e.target.value)
                    }
                    disabled={updating === order.id}
                    className="bg-gray-700 border border-gray-600 text-white
                               text-xs rounded-lg px-3 py-2 focus:outline-none
                               focus:border-purple-500 transition
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="PENDING">⏳ PENDING</option>
                    <option value="CONFIRMED">📦 CONFIRMED</option>
                    <option value="DELIVERED">✅ DELIVERED</option>
                  </select>

                  {/* Loading spinner when updating */}
                  {updating === order.id && (
                    <div
                      className="w-4 h-4 border-2 border-purple-400
                                    border-t-transparent rounded-full animate-spin"
                    ></div>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="px-6 py-4">
                <p
                  className="text-gray-400 text-xs font-medium uppercase
                               tracking-wide mb-3"
                >
                  Items
                </p>

                <div className="space-y-3">
                  {order.orderItems?.map((item, index) => {
                    const imageUrl = getImageUrl(product.imageUrl);

                    return (
                      <div key={index} className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div
                          className="w-10 h-10 bg-gray-700 rounded-lg
                                        overflow-hidden flex-shrink-0
                                        flex items-center justify-center"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center
                                       justify-center text-sm text-gray-500"
                            style={{ display: imageUrl ? "none" : "flex" }}
                          >
                            📦
                          </div>
                        </div>

                        {/* Item info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {item.productName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Qty: {item.quantity} × ₹
                            {item.price?.toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* Item total */}
                        <p
                          className="text-gray-300 text-sm font-medium
                                      flex-shrink-0"
                        >
                          ₹
                          {(item.price * item.quantity)?.toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageOrders;
