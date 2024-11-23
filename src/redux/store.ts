import { configureStore } from '@reduxjs/toolkit';
import { inputReducer } from './inputSlice';
import { faqCardReducer } from './faqCardSlice';
import { languageReducer } from './languageSlice';
import { questionsReducer } from './questionsSlice';

const store = configureStore({
  reducer: {
    input: inputReducer,
    faqCard: faqCardReducer,
    language: languageReducer,
    questions: questionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
