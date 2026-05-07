import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectIsLoggedIn, selectIsAdmin, logout } from '../features/auth/authSlice'
import { selectTotalItems, clearCart } from '../features/cart/cartSlice'

function Navbar() {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const location  = useLocation()

  const isLoggedIn = useSelector(selectIsLoggedIn)
  const isAdmin    = useSelector(selectIsAdmin)
  const user       = useSelector(selectUser)
  const totalItems = useSelector(selectTotalItems)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // -----------------------------------------------
  // Nav link class helper
  // Active = purple text + purple underline
  // Inactive = grey text, hover pe white
  // -----------------------------------------------
  const navLinkClass = (path) =>
    `transition text-sm font-medium pb-1 border-b-2
     ${isActive(path)
       ? 'text-purple-400 border-purple-400'
       : 'text-gray-400 border-transparent hover:text-white hover:border-gray-400'
     }`

  // -----------------------------------------------
  // Auth button class helper (Login / Register)
  // Active = purple bg
  // Inactive = grey bg, hover pe purple
  // -----------------------------------------------
  const authBtnClass = (path) =>
    `transition text-sm font-medium px-4 py-2 rounded-lg
     ${isActive(path)
       ? 'bg-purple-600 text-white'
       : 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
     }`

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* ---- LEFT: Logo ---- */}
        <Link
          to="/"
          className="text-2xl font-bold text-purple-500 hover:text-purple-400 transition"
        >
          🛒 ShopApp
        </Link>

        {/* ---- MIDDLE: Nav Links ---- */}
        <div className="hidden md:flex items-center gap-6">

          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>

          {isLoggedIn && (
            <Link to="/orders" className={navLinkClass('/orders')}>
              My Orders
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className={navLinkClass('/admin')}>
              Admin Panel
            </Link>
          )}

        </div>

        {/* ---- RIGHT: Cart + Auth buttons ---- */}
        <div className="flex items-center gap-3">

          {/* Cart button */}
          {isLoggedIn && (
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg
                          transition text-sm text-white
                          ${isActive('/cart')
                            ? 'bg-purple-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                          }`}
            >
              <span>🛒</span>
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white
                                 text-xs font-bold rounded-full w-5 h-5
                                 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Login / Register — dono same style */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className={authBtnClass('/login')}>
                Login
              </Link>
              <Link to="/register" className={authBtnClass('/register')}>
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm hidden md:block">
                Hi, <span className="text-white font-medium">{user?.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white
                           px-4 py-2 rounded-lg transition text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}

export default Navbar