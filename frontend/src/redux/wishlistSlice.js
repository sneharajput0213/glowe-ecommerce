
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems: (state, action) => {
      state.items = action.payload;
    },

    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },

    setWishlistError: (state, action) => {
      state.error = action.payload;
    },

    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
});

export const {
  setWishlistItems,
  setWishlistLoading,
  setWishlistError,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
