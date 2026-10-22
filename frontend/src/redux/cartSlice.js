
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },

    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCartError: (state, action) => {
      state.error = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.error = null;
    },
  },
});

export const {
  setCartItems,
  setCartLoading,
  setCartError,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
