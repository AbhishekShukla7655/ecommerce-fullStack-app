import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Page load hote hi stats fetch karo
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // GET /api/admin/stats — ADMIN JWT required
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      setError('Failed to load dashboard stats.')
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
          <p className="text-gray-400">Loading dashboard...</p>
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
            onClick={fetchStats}
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
  // MAIN DASHBOARD
  // -----------------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening in your store.
          </p>
        </div>

        {/* ---- STATS CARDS ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

          {/* Total Products */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6
                          hover:border-purple-500 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center
                              justify-center text-2xl">
                📦
              </div>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Products
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              {stats?.totalProducts ?? 0}
            </p>
            <p className="text-gray-400 text-sm">Total products in store</p>
            <Link
              to="/admin/products"
              className="text-purple-400 hover:text-purple-300 text-xs
                         mt-3 inline-block transition"
            >
              Manage Products →
            </Link>
          </div>

          {/* Total Orders */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6
                          hover:border-blue-500 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center
                              justify-center text-2xl">
                🛒
              </div>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Orders
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              {stats?.totalOrders ?? 0}
            </p>
            <p className="text-gray-400 text-sm">Total orders placed</p>
            <Link
              to="/admin/orders"
              className="text-blue-400 hover:text-blue-300 text-xs
                         mt-3 inline-block transition"
            >
              Manage Orders →
            </Link>
          </div>

          {/* Total Users */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6
                          hover:border-green-500 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center
                              justify-center text-2xl">
                👥
              </div>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Users
              </span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              {stats?.totalUsers ?? 0}
            </p>
            <p className="text-gray-400 text-sm">Registered users</p>
          </div>

        </div>

        {/* ---- QUICK ACTIONS ---- */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-xl mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Add new product */}
            <Link
              to="/admin/products/new"
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700
                         hover:border-purple-500 rounded-xl p-5 flex items-center
                         gap-4 transition group"
            >
              <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center
                              justify-center text-xl group-hover:bg-purple-800 transition">
                ➕
              </div>
              <div>
                <p className="text-white font-semibold">Add New Product</p>
                <p className="text-gray-400 text-sm">
                  Upload image and add product details
                </p>
              </div>
            </Link>

            {/* Manage orders */}
            <Link
              to="/admin/orders"
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700
                         hover:border-blue-500 rounded-xl p-5 flex items-center
                         gap-4 transition group"
            >
              <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center
                              justify-center text-xl group-hover:bg-blue-800 transition">
                📋
              </div>
              <div>
                <p className="text-white font-semibold">Manage Orders</p>
                <p className="text-gray-400 text-sm">
                  Update order status and view details
                </p>
              </div>
            </Link>

            {/* Manage products */}
            <Link
              to="/admin/products"
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700
                         hover:border-purple-500 rounded-xl p-5 flex items-center
                         gap-4 transition group"
            >
              <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center
                              justify-center text-xl group-hover:bg-purple-800 transition">
                🗂️
              </div>
              <div>
                <p className="text-white font-semibold">Manage Products</p>
                <p className="text-gray-400 text-sm">
                  Edit, delete and view all products
                </p>
              </div>
            </Link>

            {/* View store */}
            <Link
              to="/"
              className="bg-gray-800 hover:bg-gray-750 border border-gray-700
                         hover:border-green-500 rounded-xl p-5 flex items-center
                         gap-4 transition group"
            >
              <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center
                              justify-center text-xl group-hover:bg-green-800 transition">
                🏪
              </div>
              <div>
                <p className="text-white font-semibold">View Store</p>
                <p className="text-gray-400 text-sm">
                  See your store as a customer
                </p>
              </div>
            </Link>

          </div>
        </div>

        {/* ---- ADMIN NAV LINKS ---- */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-white font-bold text-lg mb-4">Admin Panel</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition"
            >
              Products
            </Link>
            <Link
              to="/admin/products/new"
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition"
            >
              Add Product
            </Link>
            <Link
              to="/admin/orders"
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition"
            >
              Orders
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard