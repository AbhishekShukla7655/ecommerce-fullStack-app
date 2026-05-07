import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'
import api from '../services/api'

function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Form state
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // -----------------------------------------------
  // Handle registration
  // -----------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend validation — passwords match check
    if (password !== confirm) {
      setError('Passwords do not match!')
      return
    }

    // Password length check
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // POST /api/auth/register
      const res = await api.post('/auth/register', { name, email, password })

      const { token, role } = res.data

      // Save to Redux + localStorage
      dispatch(setCredentials({ token, name, email, role }))

      // After register → go to home page
      navigate('/')

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Email might already be in use.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Google login same as LoginPage
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join ShopApp today</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300
                          rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Name field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white
                         rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-purple-500 focus:ring-1
                         focus:ring-purple-500 placeholder-gray-500 transition"
            />
          </div>

          {/* Email field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@gmail.com"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white
                         rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-purple-500 focus:ring-1
                         focus:ring-purple-500 placeholder-gray-500 transition"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white
                         rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-purple-500 focus:ring-1
                         focus:ring-purple-500 placeholder-gray-500 transition"
            />
          </div>

          {/* Confirm Password field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full bg-gray-700 border border-gray-600 text-white
                         rounded-lg px-4 py-3 text-sm
                         focus:outline-none focus:border-purple-500 focus:ring-1
                         focus:ring-purple-500 placeholder-gray-500 transition"
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900
                       disabled:cursor-not-allowed text-white font-semibold
                       py-3 rounded-lg transition text-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Google Login button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-100 text-gray-800
                     font-semibold py-3 rounded-lg transition text-sm
                     flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Login link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Login here
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage