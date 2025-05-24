import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  error: null,  // add error state
};

export const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newProduct = action.payload;

      const existingProductIndex = state.cart.findIndex(
        (item) =>
          item.id === newProduct.id &&
          item.color === newProduct.color &&
          item.size === newProduct.size
      );

      if (existingProductIndex !== -1) {
        // Product already exists → update quantity
        state.cart[existingProductIndex].quantity = newProduct.quantity;
      } else {
        state.cart.push(newProduct);
      }
      state.error = null;  // clear previous errors on successful add
    },
    removeFromCart: (state, action) => {
      const { id, color, size } = action.payload;
      state.cart = state.cart.filter(
        (item) => item.id !== id || item.color !== color || item.size !== size
      );
    },
    clearCart: (state) => {
      state.cart = [];
    },
    incrementQuantity: (state, action) => {
      const { id, color, size } = action.payload;
      const product = state.cart.find(
        (item) => item.id === id && item.color === color && item.size === size
      );
      if (product) {
        product.quantity += 1;
      }
    },
    decrementQuantity: (state, action) => {
      const { id, color, size } = action.payload;
      const product = state.cart.find(
        (item) => item.id === id && item.color === color && item.size === size
      );
      if (product && product.quantity > 1) {
        product.quantity -= 1;
      }
    },
    setCart: (state, action) => {
      state.cart = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  incrementQuantity,
  decrementQuantity,
  setCart,
} = CartSlice.actions;


export default CartSlice.reducer;
