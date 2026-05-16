import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem } from "../features/cart/cartSlice";
import { selectIsLoggedIn } from "../features/auth/authSlice";
import api from "../services/api";
import { getImageUrl } from "../services/imageHelper";

function ProductDetailPage() {
  const { id } = useParams(); // URL se product id lo e.g. /products/3
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false); // success feedback

  // -----------------------------------------------
  // Page load hote hi product fetch karo
  // -----------------------------------------------
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // GET /api/products/{id}
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError("Product not found or failed to load.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Add to cart handler
  // -----------------------------------------------
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      alert("This product is out of stock");
      return;
    }

    setAdding(true);

    try {
      const res = await api.post("/cart", {
        productId: product.id,
        quantity: quantity,
      });

      // Redux update — Navbar badge bhi update hoga
      dispatch(addCartItem(res.data));

      // Success feedback
      setAdded(true);
      setTimeout(() => setAdded(false), 2000); // 2 sec baad reset
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
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
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // ERROR STATE
  // -----------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Link
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white
                       px-6 py-2 rounded-lg transition text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.imageUrl);
  // -----------------------------------------------
  // MAIN RENDER
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white
                     transition mb-6 text-sm"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ---- LEFT: Product Image ---- */}
          <div
            className="bg-gray-800 rounded-2xl overflow-hidden border
                          border-gray-700 aspect-square flex items-center
                          justify-center"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback */}
            <div
              className="w-full h-full flex items-center justify-center
                         text-gray-500 text-8xl"
              style={{ display: imageUrl ? "none" : "flex" }}
            >
              📦
            </div>
          </div>

          {/* ---- RIGHT: Product Details ---- */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category badge */}
              <span
                className="inline-block bg-purple-900 text-purple-300
                               text-xs font-medium px-3 py-1 rounded-full mb-4"
              >
                {product.category}
              </span>

              {/* Product name */}
              <h1 className="text-3xl font-bold text-white mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="text-4xl font-bold text-purple-400 mb-6">
                ₹{product.price?.toLocaleString("en-IN")}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-gray-300 font-semibold mb-2">
                  Description
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Stock status */}
              <div className="mb-6">
                {product.stock > 5 && (
                  <span className="text-green-400 text-sm font-medium">
                    ✅ In Stock ({product.stock} available)
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-orange-400 text-sm font-medium">
                    ⚠️ Only {product.stock} left in stock!
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="text-red-400 text-sm font-medium">
                    ❌ Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* ---- QUANTITY + ADD TO CART ---- */}
            <div>
              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-300 text-sm font-medium">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Minus button */}
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white
                                 rounded-lg flex items-center justify-center
                                 transition font-bold"
                    >
                      −
                    </button>

                    {/* Quantity display */}
                    <span className="text-white font-semibold w-8 text-center">
                      {quantity}
                    </span>

                    {/* Plus button */}
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white
                                 rounded-lg flex items-center justify-center
                                 transition font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={`w-full py-4 rounded-xl font-semibold text-base
                            transition flex items-center justify-center gap-2
                            ${
                              product.stock === 0
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : added
                                  ? "bg-green-600 text-white"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
              >
                {adding ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white border-t-transparent
                                    rounded-full animate-spin"
                    ></div>
                    Adding...
                  </>
                ) : added ? (
                  "✅ Added to Cart!"
                ) : product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  "🛒 Add to Cart"
                )}
              </button>

              {/* Go to cart link — after adding */}
              {added && (
                <Link
                  to="/cart"
                  className="block text-center text-purple-400 hover:text-purple-300
                             text-sm mt-3 transition"
                >
                  View Cart →
                </Link>
              )}

              {/* Login prompt */}
              {!isLoggedIn && (
                <p className="text-gray-500 text-xs text-center mt-3">
                  <Link to="/login" className="text-purple-400 hover:underline">
                    Login
                  </Link>{" "}
                  to add items to your cart
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
