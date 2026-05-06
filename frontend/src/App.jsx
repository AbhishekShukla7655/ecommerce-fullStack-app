import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageProducts from './pages/admin/ManageProducts'
import ProductForm from './pages/admin/ProductForm'
import ManageOrders from './pages/admin/ManageOrders'

// Route Guards
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    // BrowserRouter enables client-side routing
    <BrowserRouter>
      <Routes>

        {/* ---- PUBLIC ROUTES — anyone can access ---- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Google OAuth2 callback — reads token from URL */}
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

        {/* ---- PROTECTED ROUTES — must be logged in ---- */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />

        <Route path="/order-confirmation" element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />

        {/* ---- ADMIN ROUTES — must be ADMIN role ---- */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin/products" element={
          <AdminRoute>
            <ManageProducts />
          </AdminRoute>
        } />

        <Route path="/admin/products/new" element={
          <AdminRoute>
            <ProductForm />
          </AdminRoute>
        } />

        <Route path="/admin/products/edit/:id" element={
          <AdminRoute>
            <ProductForm />
          </AdminRoute>
        } />

        <Route path="/admin/orders" element={
          <AdminRoute>
            <ManageOrders />
          </AdminRoute>
        } />

        {/* 404 — page not found */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-purple-500">404</h1>
              <p className="text-white text-xl mt-4">Page not found</p>
              <a href="/" className="text-purple-400 mt-4 block hover:underline">
                Go back home
              </a>
            </div>
          </div>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App