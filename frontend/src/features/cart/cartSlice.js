import { createSlice } from '@reduxjs/toolkit'

// Cart is stored only in Redux (frontend state)
// It does NOT persist on page refresh — user needs to be logged in
// The actual cart data comes from the backend DB via API calls
const initialState = {
  items: [],       // array of cart items from backend
  totalItems: 0,   // total count shown in Navbar badge
  totalPrice: 0,   // total price shown in CartPage
}

// Helper: recalculate totals from items array
// Called after every add/remove/update operation
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  )
  return { totalItems, totalPrice }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,

  reducers: {
    // Called after GET /api/cart — loads cart from backend into Redux
    setCartItems: (state, action) => {
      state.items = action.payload
      const totals = calculateTotals(action.payload)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },

    // Called after POST /api/cart — adds one item to Redux state
    addCartItem: (state, action) => {
      const newItem = action.payload

      // Check if item already exists in Redux state
      const existing = state.items.find(item => item.id === newItem.id)

      if (existing) {
        // Update existing item
        existing.quantity = newItem.quantity
      } else {
        // Add new item
        state.items.push(newItem)
      }

      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },

    // Called after PUT /api/cart/{id} — updates quantity
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)

      if (item) {
        item.quantity = quantity
      }

      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },

    // Called after DELETE /api/cart/{id} — removes one item
    removeCartItem: (state, action) => {
      const id = action.payload
      state.items = state.items.filter(item => item.id !== id)

      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },

    // Called after order is placed — empties the cart
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
    },
  },
})

export const {
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer

// Selector helpers — use these in components to read cart state
// Usage: const totalItems = useSelector(selectTotalItems)
export const selectCartItems  = (state) => state.cart.items
export const selectTotalItems = (state) => state.cart.totalItems
export const selectTotalPrice = (state) => state.cart.totalPrice