import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  setCartItems,
  clearCart,
} from '../features/cart/cartSlice'
import api from '../services/api'

function CheckoutPage() {
  const navigate   = useNavigate()
  const dispatch   = useDispatch()

  const cartItems  = useSelector(selectCartItems)
  const totalItems = useSelector(selectTotalItems)
  const totalPrice = useSelector(selectTotalPrice)

  const [loading,   setLoading]   = useState(false)
  const [pageLoad,  setPageLoad]  = useState(true)
  const [error,     setError]     = useState('')

  // -----------------------------------------------
  // Agar Redux mein cart empty hai toh
  // backend se fetch karo (page refresh case)
  // -----------------------------------------------
  useEffect(() => {
    const loadCart = async () => {
      if (cartItems.length === 0) {
        try {
          const res = await api.get('/cart')
          dispatch(setCartItems(res.data))
        } catch (err) {
          console.error('Failed to load cart:', err)
        }
      }
      setPageLoad(false)
    }
    loadCart()
  }, [])

  // -----------------------------------------------
  // Confirm Payment — order place karo
  // -----------------------------------------------
  const handleConfirmPayment = async () => {
    setLoading(true)
    setError('')

    try {
      // POST /api/orders — backend cart se order banata hai automatically
      const res = await api.post('/orders')

      // Redux cart clear karo — order place ho gaya
      dispatch(clearCart())

      // Order confirmation page pe bhejo with order data
      navigate('/order-confirmation', {
        state: { order: res.data } // order data pass karo
      })

    } catch (err) {
      console.error('Order failed:', err)
      setError(
        err.response?.data?.message ||
        'Failed to place order. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------
  // PAGE LOADING
  // -----------------------------------------------
  if (pageLoad) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent
                        rounded-full animate-spin"></div>
      </div>
    )
  }

  // -----------------------------------------------
  // EMPTY CART — checkout nahi ho sakta
  // -----------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-white text-xl font-semibold mb-4">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white
                       px-6 py-3 rounded-xl transition font-semibold"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  // -----------------------------------------------
  // MAIN CHECKOUT PAGE
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Review your order before confirming</p>
        </div>

        {/* ---- ORDER SUMMARY CARD ---- */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-5 pb-3
                         border-b border-gray-700">
            Order Summary
          </h2>

          {/* Cart items list */}
          <div className="space-y-4 mb-6">
            {cartItems.map(item => {
              const imageUrl = item.product?.imageUrl
                ? `http://localhost:8080/images/${item.product.imageUrl}`
                : null

              return (
                <div key={item.id} className="flex items-center gap-4">

                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden
                                  flex-shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center
                                 text-xl text-gray-500"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      📦
                    </div>
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Qty: {item.quantity} ×
                      ₹{item.product?.price?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Item subtotal */}
                  <p className="text-white font-semibold text-sm flex-shrink-0">
                    ₹{(item.product?.price * item.quantity)
                        ?.toLocaleString('en-IN')}
                  </p>

                </div>
              )
            })}
          </div>

          {/* Price breakdown */}
          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Subtotal ({totalItems} items)
              </span>
              <span className="text-gray-300">
                ₹{totalPrice?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping</span>
              <span className="text-green-400">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax</span>
              <span className="text-gray-300">Included</span>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3
                            border-t border-gray-700 mt-2">
              <span className="text-white font-bold text-lg">Total</span>
              <span className="text-purple-400 font-bold text-2xl">
                ₹{totalPrice?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* ---- MOCK PAYMENT CARD ---- */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Payment</h2>

          {/* Mock payment info */}
          <div className="bg-gray-700 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-white text-sm font-medium">
                Mock Payment (Demo Mode)
              </p>
              <p className="text-gray-400 text-xs">
                No real payment — just click confirm to place order
              </p>
            </div>
          </div>

          {/* Fake card UI for demo look */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-700
                          rounded-xl p-4 text-white">
            <p className="text-xs text-purple-300 mb-3">DEMO CARD</p>
            <p className="text-lg font-mono tracking-widest mb-3">
              **** **** **** 4242
            </p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-purple-300 text-xs">CARD HOLDER</p>
                <p className="font-medium">Demo User</p>
              </div>
              <div>
                <p className="text-purple-300 text-xs">EXPIRES</p>
                <p className="font-medium">12/99</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300
                          rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ---- CONFIRM PAYMENT BUTTON ---- */}
        <button
          onClick={handleConfirmPayment}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700
                     disabled:bg-purple-900 disabled:cursor-not-allowed
                     text-white font-bold py-4 rounded-2xl transition
                     text-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent
                              rounded-full animate-spin"></div>
              Placing Order...
            </>
          ) : (
            <>
              🔒 Confirm Payment — ₹{totalPrice?.toLocaleString('en-IN')}
            </>
          )}
        </button>

        {/* Back to cart */}
        <button
          onClick={() => navigate('/cart')}
          className="w-full text-gray-400 hover:text-white text-sm
                     mt-4 transition text-center"
        >
          ← Back to Cart
        </button>

      </div>
    </div>
  )
}

export default CheckoutPage