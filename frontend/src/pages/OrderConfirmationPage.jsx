import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { getImageUrl } from "../services/imageHelper";
function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Step 28 mein navigate karte waqt order data pass kiya tha:
  // navigate('/order-confirmation', { state: { order: res.data } })
  const order = location.state?.order;

  // Agar koi directly is page pe aaye bina order ke → home bhejo
  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, []);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success animation card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center">
          {/* Success icon */}
          <div
            className="w-20 h-20 bg-green-900 rounded-full flex items-center
                          justify-center mx-auto mb-6 text-4xl"
          >
            ✅
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Order Placed!</h1>
          <p className="text-gray-400 mb-8">
            Thank you! Your order has been confirmed.
          </p>

          {/* Order details */}
          <div className="bg-gray-700 rounded-xl p-5 text-left mb-6">
            {/* Order ID + Status */}
            <div
              className="flex justify-between items-center mb-4
                            pb-4 border-b border-gray-600"
            >
              <div>
                <p className="text-gray-400 text-xs">Order ID</p>
                <p className="text-white font-bold text-lg">#{order.id}</p>
              </div>
              <span
                className="bg-yellow-900 text-yellow-300 text-xs
                               font-medium px-3 py-1 rounded-full"
              >
                {order.status}
              </span>
            </div>

            {/* Order items */}
            <div className="space-y-3 mb-4">
              {order.orderItems?.map((item, index) => {
                const imageUrl = getImageUrl(product.imageUrl);

                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div
                      className="w-10 h-10 bg-gray-600 rounded-lg overflow-hidden
                                    flex-shrink-0 flex items-center justify-center"
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
                        className="w-full h-full flex items-center justify-center
                                   text-sm text-gray-500"
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
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Item price */}
                    <p className="text-gray-300 text-sm flex-shrink-0">
                      ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div
              className="flex justify-between items-center pt-4
                            border-t border-gray-600"
            >
              <span className="text-white font-bold">Total Paid</span>
              <span className="text-purple-400 font-bold text-xl">
                ₹{order.totalAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Link
              to="/orders"
              className="block w-full bg-purple-600 hover:bg-purple-700
                         text-white font-semibold py-3 rounded-xl transition"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-700 hover:bg-gray-600
                         text-white font-semibold py-3 rounded-xl transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
