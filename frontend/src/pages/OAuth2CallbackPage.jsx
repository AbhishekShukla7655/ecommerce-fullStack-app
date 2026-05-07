import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/auth/authSlice'

function OAuth2CallbackPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const name  = params.get('name')
    const email = params.get('email')
    const role  = params.get('role')

    if (token) {
      dispatch(setCredentials({ token, name, email, role }))
      navigate('/')
    } else {
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