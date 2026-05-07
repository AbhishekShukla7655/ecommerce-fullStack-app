import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

// Status ke hisaab se badge color
const statusColors = {
  PENDING:   'bg-yellow-900 text-yellow-300 border-yellow-700',
  CONFIRMED: 'bg-blue-900 text-blue-300 border-blue-700',
  DELIVERED: 'bg-green-900 text-green-300 border-green-700',
}

// Status ke saath emoji
const statusEmoji = {
  PENDING:   '⏳',
  CONFIRMED: '📦',
  DELIVERED: '✅',
}

function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Page load hote hi orders fetch karo
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // GET /api/orders/my — sirf logged-in user ke orders
      const res = await api.get('/orders/my')
      setOrders(res.data)
    } catch (err) {
      setError('Failed to load orders.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------
  // LOADING
  // -----------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
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
    )
  }

  // -----------------------------------------------
  // NO ORDERS YET
  // -----------------------------------------------
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-7xl mb-6">📋</p>
          <h2 className="text-2xl font-bold text-white mb-3">
            No orders yet
          </h2>
          <p className="text-gray-400 mb-8">
            Place your first order to see it here!
          </p>
          <Link
            to="/"
            className="bg-purple-600 hover:bg-purple-700 text-white
                       px-8 py-3 rounded-xl transition font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  // -----------------------------------------------
  // ORDERS LIST
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8">
          My Orders
          <span className="text-gray-400 text-lg font-normal ml-3">
            ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
          </span>
        </h1>

        {/* Orders list */}
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
            >

              {/* Order header */}
              <div className="flex items-center justify-between px-6 py-4
                              border-b border-gray-700 bg-gray-750">
                <div className="flex items-center gap-4">

                  {/* Order ID */}
                  <div>
                    <p className="text-gray-400 text-xs">Order ID</p>
                    <p className="text-white font-bold">#{order.id}</p>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block">
                    <p className="text-gray-400 text-xs">Date</p>
                    <p className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                </div>

                {/* Status badge */}
                <span className={`text-xs font-medium px-3 py-1 rounded-full border
                                 ${statusColors[order.status] ||
                                   'bg-gray-700 text-gray-300 border-gray-600'}`}>
                  {statusEmoji[order.status]} {order.status}
                </span>
              </div>

              {/* Order items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.orderItems?.map((item, index) => {
                    const imageUrl = item.productImageUrl
                      ? `http://localhost:8080/images/${item.productImageUrl}`
                      : null

                    return (
                      <div key={index} className="flex items-center gap-3">

                        {/* Thumbnail */}
                        <div className="w-12 h-12 bg-gray-700 rounded-lg
                                        overflow-hidden flex-shrink-0
                                        flex items-center justify-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex items-center
                                       justify-center text-lg text-gray-500"
                            style={{ display: imageUrl ? 'none' : 'flex' }}
                          >
                            📦
                          </div>
                        </div>

                        {/* Item details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {item.productName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Qty: {item.quantity} ×
                            ₹{item.price?.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Item total */}
                        <p className="text-gray-300 text-sm flex-shrink-0">
                          ₹{(item.price * item.quantity)
                              ?.toLocaleString('en-IN')}
                        </p>

                      </div>
                    )
                  })}
                </div>

                {/* Order total */}
                <div className="flex justify-between items-center mt-4 pt-4
                                border-t border-gray-700">
                  <span className="text-gray-400 text-sm">
                    {order.orderItems?.length}{' '}
                    {order.orderItems?.length === 1 ? 'item' : 'items'}
                  </span>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Order Total</p>
                    <p className="text-purple-400 font-bold text-lg">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Continue shopping */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 transition text-sm"
          >
            ← Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}

export default OrdersPage