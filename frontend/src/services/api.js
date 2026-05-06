import axios from 'axios'

// -----------------------------------------------
// Create a custom Axios instance
// Base URL = your Spring Boot backend
// Har API call automatically is base URL se start hogi
// e.g. api.get('/products') = GET http://localhost:8080/api/products
// -----------------------------------------------
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// -----------------------------------------------
// REQUEST INTERCEPTOR
// Har request jaane se pehle yeh run hota hai
// Agar localStorage mein token hai toh
// automatically Authorization header add ho jaata hai
//
// Matlab: har protected API call mein manually
// "Authorization: Bearer ..." likhne ki zaroorat nahi
// -----------------------------------------------
api.interceptors.request.use(
  (config) => {
    // localStorage se token read karo
    const token = localStorage.getItem('token')

    if (token) {
      // Header add karo: "Authorization: Bearer eyJhbG..."
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// -----------------------------------------------
// RESPONSE INTERCEPTOR
// Har response aane ke baad yeh run hota hai
// Agar backend 401 Unauthorized bheje (token expired)
// toh automatically logout karke login page pe bhejo
// -----------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Response theek hai — as-is return karo
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired ya invalid — clear everything
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      // Login page pe redirect karo
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api


// -----------------------------------------------
// USAGE EXAMPLES (in any component or page):
//
// import api from '../services/api'
//
// // GET request (public — no token needed, interceptor handles it)
// const res = await api.get('/products')
//
// // POST with JSON body
// const res = await api.post('/auth/login', { email, password })
//
// // POST with image (multipart/form-data)
// const formData = new FormData()
// formData.append('name', 'Nike Shoe')
// formData.append('image', imageFile)
// const res = await api.post('/products', formData, {
//   headers: { 'Content-Type': 'multipart/form-data' }
// })
//
// // DELETE
// await api.delete(`/cart/${id}`)
// -----------------------------------------------