import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAdmin } from '../features/auth/authSlice'

// Agar user ADMIN nahi hai toh home page pe bhejo
// Usage: <AdminRoute><AdminDashboard /></AdminRoute>
function AdminRoute({ children }) {
  const isAdmin = useSelector(selectIsAdmin)

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute