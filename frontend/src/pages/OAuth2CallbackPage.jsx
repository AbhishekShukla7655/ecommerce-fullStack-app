// This page handles the redirect after Google login
// Reads token from URL and saves to Redux + localStorage
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'

function OAuth2CallbackPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    // Read token and user info from URL query params
    // URL looks like: /oauth2/callback?token=eyJ...&name=John&email=...&role=USER
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const name  = params.get('name')
    const email = params.get('email')
    const role  = params.get('role')

    if (token) {
      // Save to Redux + localStorage
      dispatch(setCredentials({ token, name, email, role }))
      // Redirect to home page
      navigate('/')
    } else {
      // Something went wrong — go to login
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-lg">Logging you in with Google...</p>
    </div>
  )
}

export default OAuth2CallbackPage