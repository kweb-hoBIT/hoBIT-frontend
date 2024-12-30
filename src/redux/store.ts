import { configureStore } from '@reduxjs/toolkit';
import { inputReducer } from './inputSlice';
import { faqCardReducer } from './faqCardSlice';
import { languageReducer } from './languageSlice';
import { questionsReducer } from './questionsSlice';
import { menuReducer } from './menuSlice';
import { homeReducer } from './homeSlice';

const store = configureStore({
  reducer: {
    input: inputReducer,
    faqCard: faqCardReducer,
    language: languageReducer,
    questions: questionsReducer,
    menu: menuReducer,
    home: homeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
