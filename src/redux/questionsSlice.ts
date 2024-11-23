// questionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from '../types/faq';

interface QuestionsState {
  questions: Question[];
}

const initialState: QuestionsState = {
  questions: [],
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
  },
});

export const { setQuestions } = questionsSlice.actions;
export const questionsReducer = questionsSlice.reducer;
