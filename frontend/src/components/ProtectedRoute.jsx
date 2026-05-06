import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsLoggedIn } from '../features/auth/authSlice'

// Agar user logged in nahi hai toh login page pe bhejo
// Usage: <ProtectedRoute><CartPage /></ProtectedRoute>
function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute