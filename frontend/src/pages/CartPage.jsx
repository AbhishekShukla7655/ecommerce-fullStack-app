import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "../services/imageHelper";
import {
  setCartItems,
  updateCartItem,
  removeCartItem,
  clearCart,
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
} from "../features/cart/cartSlice";
import api from "../services/api";

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux se cart state read karo
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectTotalItems);
  const totalPrice = useSelector(selectTotalPrice);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // konsa item update ho raha hai
  const [removing, setRemoving] = useState(null); // konsa item remove ho raha hai

  // -----------------------------------------------
  // Page load hote hi cart fetch karo backend se
  // -----------------------------------------------
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // GET /api/cart — JWT automatically attach hoga (api.js interceptor)
      const res = await api.get("/cart");

      // Redux mein save karo — totalItems aur totalPrice bhi update honge
      dispatch(setCartItems(res.data));
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Quantity update: + ya - button click
  // -----------------------------------------------
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    // 0 ya usse kam hoga toh remove karo
    if (newQuantity < 1) {
      handleRemove(cartItemId);
      return;
    }

    setUpdating(cartItemId);

    try {
      // PUT /api/cart/{id}
      await api.put(`/cart/${cartItemId}`, { quantity: newQuantity });

      // Redux update karo
      dispatch(updateCartItem({ id: cartItemId, quantity: newQuantity }));
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  // -----------------------------------------------
  // Item remove karo
  // -----------------------------------------------
  const handleRemove = async (cartItemId) => {
    setRemoving(cartItemId);

    try {
      // DELETE /api/cart/{id}
      await api.delete(`/cart/${cartItemId}`);

      // Redux se bhi hatao
      dispatch(removeCartItem(cartItemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  // -----------------------------------------------
  // LOADING STATE
  // -----------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-purple-600 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p className="text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // EMPTY CART STATE
  // -----------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-8xl mb-6">🛒</p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-8">
            Add some products to get started!
          </p>
          <Link
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white
                       px-8 py-3 rounded-xl transition font-semibold"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // MAIN CART RENDER
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Your Cart
            <span className="text-gray-400 text-lg font-normal ml-3">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          </h1>

          {/* Clear entire cart button */}
          <button
            onClick={async () => {
              if (!window.confirm("Clear entire cart?")) return;
              try {
                // Remove each item one by one
                for (const item of cartItems) {
                  await api.delete(`/cart/${item.id}`);
                }
                dispatch(clearCart());
              } catch (err) {
                console.error("Failed to clear cart:", err);
              }
            }}
            className="text-red-400 hover:text-red-300 text-sm transition"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---- LEFT: Cart Items List ---- */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const imageUrl = getImageUrl(product.imageUrl);

              return (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 p-4
                             flex gap-4 items-center"
                >
                  {/* Product image thumbnail */}
                  <div
                    className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden
                                  flex-shrink-0 flex items-center justify-center"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center
                                 text-2xl text-gray-500"
                      style={{ display: imageUrl ? "none" : "flex" }}
                    >
                      📦
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.id}`}
                      className="text-white font-semibold text-sm hover:text-purple-400
                                 transition line-clamp-2"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.product?.category}
                    </p>
                    <p className="text-purple-400 font-bold text-sm mt-1">
                      ₹{item.product?.price?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={updating === item.id}
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white
                                 rounded-lg flex items-center justify-center
                                 transition font-bold disabled:opacity-50"
                    >
                      −
                    </button>

                    <span className="text-white font-semibold w-8 text-center">
                      {updating === item.id ? (
                        <span className="text-purple-400">...</span>
                      ) : (
                        item.quantity
                      )}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      disabled={updating === item.id}
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white
                                 rounded-lg flex items-center justify-center
                                 transition font-bold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Item total price */}
                  <div className="text-right flex-shrink-0 min-w-16">
                    <p className="text-white font-bold text-sm">
                      ₹
                      {(item.product?.price * item.quantity)?.toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removing === item.id}
                    className="text-gray-500 hover:text-red-400 transition
                               text-lg flex-shrink-0 disabled:opacity-50"
                    title="Remove item"
                  >
                    {removing === item.id ? "..." : "✕"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ---- RIGHT: Order Summary ---- */}
          <div className="lg:col-span-1">
            <div
              className="bg-gray-800 rounded-xl border border-gray-700 p-6
                            sticky top-24"
            >
              <h2 className="text-white font-bold text-lg mb-6">
                Order Summary
              </h2>

              {/* Items breakdown */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate mr-2">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="text-gray-300 flex-shrink-0">
                      ₹
                      {(item.product?.price * item.quantity)?.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-purple-400 font-bold text-xl">
                    ₹{totalPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white
                           font-semibold py-3 rounded-xl transition text-sm"
              >
                Proceed to Checkout →
              </button>

              {/* Continue shopping */}
              <Link
                to="/"
                className="block text-center text-gray-400 hover:text-white
                           text-sm mt-4 transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
