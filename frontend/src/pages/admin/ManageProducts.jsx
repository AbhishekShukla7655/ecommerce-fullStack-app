import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../../services/imageHelper";

function ManageProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null); // konsa product delete ho raha hai

  // Page load hote hi products fetch karo
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Delete product
  // -----------------------------------------------
  const handleDelete = async (productId, productName) => {
    // Confirm karo pehle
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(productId);

    try {
      // DELETE /api/products/{id} — ADMIN JWT required
      await api.delete(`/products/${productId}`);

      // UI se bhi remove karo — page reload ki zaroorat nahi
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleting(null);
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
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // MAIN PAGE
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Manage Products
            </h1>
            <p className="text-gray-400 text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""} total
            </p>
          </div>

          {/* Add new product button */}
          <Link
            to="/admin/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold
                       px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            ➕ Add Product
          </Link>
        </div>

        {/* Back to dashboard */}
        <Link
          to="/admin"
          className="text-gray-400 hover:text-white text-sm transition mb-6
                     inline-block"
        >
          ← Back to Dashboard
        </Link>

        {/* Error */}
        {error && (
          <div
            className="bg-red-900 border border-red-700 text-red-300
                          rounded-lg px-4 py-3 mb-6 text-sm"
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-white text-xl font-semibold mb-2">
              No products yet
            </p>
            <p className="text-gray-400 mb-6">
              Add your first product to get started
            </p>
            <Link
              to="/admin/products/new"
              className="bg-purple-600 hover:bg-purple-700 text-white
                         px-6 py-3 rounded-xl transition font-semibold"
            >
              Add First Product
            </Link>
          </div>
        )}

        {/* ---- PRODUCTS TABLE ---- */}
        {products.length > 0 && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Table header */}
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-750
                            border-b border-gray-700 text-xs font-medium
                            text-gray-400 uppercase tracking-wide"
            >
              <div className="col-span-1">Image</div>
              <div className="col-span-3">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-700">
              {products.map((product) => {
                const backendUrl =
                  import.meta.env.VITE_API_URL?.replace("/api", "") ||
                  "http://localhost:8080";
                window.location.href = `${backendUrl}/oauth2/authorization/google`;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center
                               hover:bg-gray-750 transition"
                  >
                    {/* Image thumbnail */}
                    <div className="col-span-1">
                      <div
                        className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden
                                      flex items-center justify-center flex-shrink-0"
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
                        <div
                          className="w-full h-full flex items-center justify-center
                                     text-xl text-gray-500"
                          style={{ display: imageUrl ? "none" : "flex" }}
                        >
                          📦
                        </div>
                      </div>
                    </div>

                    {/* Product name + description */}
                    <div className="col-span-3">
                      <p className="text-white font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">
                        {product.description || "No description"}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span
                        className="bg-gray-700 text-gray-300 text-xs
                                       px-2 py-1 rounded-full"
                      >
                        {product.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2">
                      <p className="text-white font-semibold text-sm">
                        ₹{product.price?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Stock */}
                    <div className="col-span-1">
                      <span
                        className={`text-xs font-medium
                        ${
                          product.stock === 0
                            ? "text-red-400"
                            : product.stock <= 5
                              ? "text-orange-400"
                              : "text-green-400"
                        }`}
                      >
                        {product.stock === 0 ? "Out" : product.stock}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      {/* View button */}
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300
                                   text-xs px-3 py-1.5 rounded-lg transition"
                        target="_blank" // new tab mein khulega
                      >
                        View
                      </Link>

                      {/* Edit button */}
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="bg-blue-900 hover:bg-blue-800 text-blue-300
                                   text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </Link>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="bg-red-900 hover:bg-red-800 text-red-300
                                   text-xs px-3 py-1.5 rounded-lg transition
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === product.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageProducts;
