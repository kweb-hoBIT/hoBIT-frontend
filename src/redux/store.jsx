// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { inputReducer } from './inputSlice';

const store = configureStore({
  reducer: {
    input: inputReducer,
  },
});

export default store;
