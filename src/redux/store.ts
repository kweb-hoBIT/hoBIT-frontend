import { configureStore } from '@reduxjs/toolkit';
import { inputReducer } from './inputSlice';
import { faqCardReducer } from './faqCardSlice';
import { languageReducer } from './languageSlice';

const store = configureStore({
  reducer: {
    input: inputReducer,
    faqCard: faqCardReducer,
    language: languageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
