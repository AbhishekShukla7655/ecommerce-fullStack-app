import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { getImageUrl } from "../services/imageHelper";
function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // edit mode mein id hoga, add mode mein undefined

  // Agar id hai toh edit mode, warna add mode
  const isEditMode = Boolean(id);

  // Form fields state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  // Image state
  const [imageFile, setImageFile] = useState(null); // selected file object
  const [imagePreview, setImagePreview] = useState(null); // preview URL (blob)
  const [existingImage, setExistingImage] = useState(null); // current image in DB

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); // edit mode mein product fetch
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------------------------
  // Edit mode: existing product data fetch karo
  // -----------------------------------------------
  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const res = await api.get(`/products/${id}`);
      const product = res.data;

      // Form fields fill karo existing data se
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setCategory(product.category || "");
      setStock(product.stock || "");

      // Existing image store karo
      // Agar admin new image nahi choose karta toh yeh same rahega
      if (product.imageUrl) {
        setExistingImage(product.imageUrl);
        setImagePreview(getImageUrl(product.imageUrl));
      }
    } catch (err) {
      setError("Failed to load product data.");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // -----------------------------------------------
  // Image file select hone pe preview banao
  // -----------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // File size check — 5MB se zyada nahi
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    // File type check
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, WEBP images allowed");
      return;
    }

    setError("");
    setImageFile(file);

    // Preview banao — URL.createObjectURL() browser mein local URL banata hai
    // Yeh URL sirf is browser session mein kaam karta hai
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // -----------------------------------------------
  // Form submit — Add ya Edit
  // -----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (!name || !price || !category || !stock) {
      setError("Please fill in all required fields");
      return;
    }

    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (parseInt(stock) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setLoading(true);

    try {
      // -----------------------------------------------
      // IMPORTANT: Image upload ke liye FormData use karna zaroori hai
      // JSON se file send nahi ho sakti — sirf FormData se hoti hai
      // -----------------------------------------------
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price));
      formData.append("category", category);
      formData.append("stock", parseInt(stock));

      // Sirf nai image hai toh append karo
      // Edit mode mein agar koi nai image nahi choose ki toh image field nahi bhejte
      // Backend apne aap purani image rakhega
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditMode) {
        // PUT /api/products/{id} — product update karo
        await api.put(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Product updated successfully!");
      } else {
        // POST /api/products — naya product add karo
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Product added successfully!");

        // Add mode mein form reset karo
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setStock("");
        setImageFile(null);
        setImagePreview(null);
      }

      // 1.5 second baad products list pe wapas jao
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Submit failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // FETCHING STATE (edit mode mein data load ho raha hai)
  // -----------------------------------------------
  if (fetching) {
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
  // MAIN FORM
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/products")}
            className="text-gray-400 hover:text-white text-sm transition mb-4
                       flex items-center gap-2"
          >
            ← Back to Products
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isEditMode
              ? "Update product details below"
              : "Fill in the details to add a new product"}
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div
            className="bg-green-900 border border-green-700 text-green-300
                          rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2"
          >
            ✅ {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="bg-red-900 border border-red-700 text-red-300
                          rounded-lg px-4 py-3 mb-6 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---- IMAGE UPLOAD SECTION ---- */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-white font-semibold mb-4">Product Image</h2>

            {/* Image preview */}
            <div className="mb-4">
              <div
                className="w-full h-56 bg-gray-700 rounded-xl overflow-hidden
                              flex items-center justify-center border-2 border-dashed
                              border-gray-600"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-5xl mb-3">🖼️</p>
                    <p className="text-gray-400 text-sm">No image selected</p>
                    <p className="text-gray-500 text-xs mt-1">
                      JPG, PNG, WEBP — max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File input */}
            <label className="block">
              <span className="sr-only">Choose image</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-medium
                           file:bg-purple-900 file:text-purple-300
                           hover:file:bg-purple-800
                           file:cursor-pointer cursor-pointer"
              />
            </label>

            {/* Edit mode mein existing image info */}
            {isEditMode && existingImage && !imageFile && (
              <p className="text-gray-400 text-xs mt-2">
                📌 Current image will be kept if no new image is selected
              </p>
            )}

            {/* New image selected info */}
            {imageFile && (
              <p className="text-green-400 text-xs mt-2">
                ✅ New image selected: {imageFile.name}
              </p>
            )}
          </div>

          {/* ---- PRODUCT DETAILS SECTION ---- */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-5">
            <h2 className="text-white font-semibold">Product Details</h2>

            {/* Product Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nike Air Max 2024"
                required
                className="w-full bg-gray-700 border border-gray-600 text-white
                           rounded-lg px-4 py-3 text-sm focus:outline-none
                           focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                           placeholder-gray-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the product..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 text-white
                           rounded-lg px-4 py-3 text-sm focus:outline-none
                           focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                           placeholder-gray-500 transition resize-none"
              />
            </div>

            {/* Price + Stock row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Price (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999.99"
                  min="0"
                  step="0.01"
                  required
                  className="w-full bg-gray-700 border border-gray-600 text-white
                             rounded-lg px-4 py-3 text-sm focus:outline-none
                             focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                             placeholder-gray-500 transition"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Stock <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="100"
                  min="0"
                  required
                  className="w-full bg-gray-700 border border-gray-600 text-white
                             rounded-lg px-4 py-3 text-sm focus:outline-none
                             focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                             placeholder-gray-500 transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white
                           rounded-lg px-4 py-3 text-sm focus:outline-none
                           focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                           transition"
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Footwear">Footwear</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          {/* ---- SUBMIT BUTTON ---- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700
                       disabled:bg-purple-900 disabled:cursor-not-allowed
                       text-white font-bold py-4 rounded-2xl transition
                       text-base flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div
                  className="w-5 h-5 border-2 border-white border-t-transparent
                                rounded-full animate-spin"
                ></div>
                {isEditMode ? "Updating..." : "Adding Product..."}
              </>
            ) : isEditMode ? (
              "✅ Update Product"
            ) : (
              "➕ Add Product"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
