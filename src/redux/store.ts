import { configureStore } from '@reduxjs/toolkit';
import { inputReducer } from './inputSlice';
import { faqCardReducer } from './faqCardSlice';
import { languageReducer } from './languageSlice';
import { questionsReducer } from './questionsSlice';
import { menuReducer } from './menuSlice';
import { homeReducer } from './homeSlice';
import { SeniorFaqIdReducer } from './SeniorFaqIdSlice';
import { feedbackReducer } from './feedbackSlice';
import { imageReducer } from './imageSlice';

const store = configureStore({
  reducer: {
    image: imageReducer,
    input: inputReducer,
    faqCard: faqCardReducer,
    language: languageReducer,
    questions: questionsReducer,
    menu: menuReducer,
    home: homeReducer,
    seniorFaqId: SeniorFaqIdReducer,
    feedback: feedbackReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
