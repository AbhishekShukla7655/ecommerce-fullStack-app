import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

// Yeh categories tumhare products ke hisaab se change kar sakte ho
const CATEGORIES = [
  'All',
  'Electronics',
  'Footwear',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
]

function HomePage() {
  const [products,         setProducts]         = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState('')
  const [search,           setSearch]           = useState('')
  const [activeCategory,   setActiveCategory]   = useState('All')

  // -----------------------------------------------
  // App load hote hi saare products fetch karo
  // -----------------------------------------------
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // GET /api/products — public endpoint, no token needed
      const res = await api.get('/products')
      setProducts(res.data)
      setFilteredProducts(res.data)
    } catch (err) {
      setError('Failed to load products. Is the backend running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------
  // Search + Filter logic
  // Jab bhi search ya category change ho, products filter karo
  // -----------------------------------------------
  useEffect(() => {
    let result = products

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(
        p => p.category.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    // Search filter (name mein dhundo, case insensitive)
    if (search.trim() !== '') {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredProducts(result)
  }, [search, activeCategory, products])

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900">

      {/* ---- HERO SECTION ---- */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900
                      border-b border-gray-800 py-12 px-4 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Welcome to <span className="text-purple-400">ShopApp</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Discover amazing products at great prices
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-800 border border-gray-600 text-white
                       rounded-full px-6 py-3 pr-12 text-sm
                       focus:outline-none focus:border-purple-500
                       placeholder-gray-500 transition"
          />
          {/* Search icon */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* ---- CATEGORY FILTER ---- */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                         transition border
                         ${activeCategory === category
                           ? 'bg-purple-600 text-white border-purple-600'
                           : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-purple-500'
                         }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ---- RESULTS COUNT ---- */}
        {!loading && !error && (
          <p className="text-gray-400 text-sm mb-6">
            {filteredProducts.length === 0
              ? 'No products found'
              : `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`
            }
            {activeCategory !== 'All' && (
              <span> in <span className="text-purple-400">{activeCategory}</span></span>
            )}
            {search && (
              <span> for "<span className="text-white">{search}</span>"</span>
            )}
          </p>
        )}

        {/* ---- LOADING STATE ---- */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent
                              rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          </div>
        )}

        {/* ---- ERROR STATE ---- */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-purple-600 hover:bg-purple-700 text-white
                         px-6 py-2 rounded-lg transition text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ---- EMPTY STATE ---- */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-white text-xl font-semibold mb-2">No products found</p>
            <p className="text-gray-400 mb-6">
              Try a different search term or category
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              className="bg-purple-600 hover:bg-purple-700 text-white
                         px-6 py-2 rounded-lg transition text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ---- PRODUCT GRID ---- */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                          lg:grid-cols-5 gap-4 pb-12">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default HomePage