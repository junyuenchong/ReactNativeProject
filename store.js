// store.js
import { configureStore } from "@reduxjs/toolkit";
import CartReducer from "./redux/CartReducer";
import { addressReducer } from "./redux/AddressReducer";

const store = configureStore({
  reducer: {
    cart: CartReducer,
    address: addressReducer,
  },
});

export default store;
