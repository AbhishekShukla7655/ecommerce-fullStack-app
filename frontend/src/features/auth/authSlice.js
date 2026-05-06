import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null

const tokenFromStorage = localStorage.getItem('token')
    ? localStorage.getItem('token')
    : null

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {

    setCredentials: (state, action) => {
      const { token, name, email, role } = action.payload

      state.token = token
      state.user = { name, email, role }


      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({ name, email, role }))
    },


    logout: (state) => {
      state.token = null
      state.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectToken = (state) => state.auth.token
export const selectUser  = (state) => state.auth.user
export const selectIsLoggedIn = (state) => state.auth.token !== null
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN'