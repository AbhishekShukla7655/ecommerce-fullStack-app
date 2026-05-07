import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addCartItem } from '../features/cart/cartSlice'
import { selectIsLoggedIn } from '../features/auth/authSlice'
import api from '../services/api'

function ProductCard({ product }) {
  const dispatch   = useDispatch()
  const isLoggedIn = useSelector(selectIsLoggedIn)

  // -----------------------------------------------
  // Add to cart button handler
  // -----------------------------------------------
  const handleAddToCart = async (e) => {
    // Link ke andar button hai — click event Link ko na mile
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      alert('Please login to add items to cart')
      return
    }

    try {
      // POST /api/cart
      const res = await api.post('/cart', {
        productId: product.id,
        quantity: 1,
      })

      // Redux mein add karo — Navbar badge update hoga
      dispatch(addCartItem(res.data))

      alert(`${product.name} added to cart!`)

    } catch (err) {
      console.error('Add to cart failed:', err)
      alert('Failed to add to cart. Please try again.')
    }
  }

  // Image URL build karo
  // Backend se sirf filename aata hai e.g. "abc123_shoe.jpg"
  // Full URL: http://localhost:8080/images/abc123_shoe.jpg
  const imageUrl = product.imageUrl
    ? `http://localhost:8080/images/${product.imageUrl}`
    : null

  return (
    // Poora card ek link hai — click karo toh product detail page pe jao
    <Link to={`/products/${product.id}`}>
      <div className="bg-gray-800 rounded-xl border border-gray-700
                      hover:border-purple-500 transition-all duration-200
                      hover:shadow-lg hover:shadow-purple-900/20
                      overflow-hidden group cursor-pointer">

        {/* Product Image */}
        <div className="aspect-square bg-gray-700 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105
                         transition-transform duration-300"
              // Agar image load na ho toh fallback dikhao
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}

          {/* Fallback — image nahi hai ya load nahi hui */}
          <div
            className="w-full h-full flex items-center justify-center text-gray-500 text-4xl"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            📦
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">

          {/* Category badge */}
          <span className="text-xs text-purple-400 font-medium uppercase tracking-wide">
            {product.category}
          </span>

          {/* Product name */}
          <h3 className="text-white font-semibold text-sm mt-1 mb-1 line-clamp-2">
            {product.name}
          </h3>

          {/* Price + Add to cart row */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-white font-bold text-lg">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="bg-purple-600 hover:bg-purple-700 text-white
                         text-xs font-medium px-3 py-2 rounded-lg transition"
            >
              + Cart
            </button>
          </div>

          {/* Stock indicator */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-orange-400 text-xs mt-2">
              Only {product.stock} left!
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-red-400 text-xs mt-2">Out of stock</p>
          )}

        </div>
      </div>
    </Link>
  )
}

export default ProductCard