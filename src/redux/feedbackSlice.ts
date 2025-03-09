import { createSlice } from '@reduxjs/toolkit';

interface FeedbackState {
  feedbackClicked: boolean;
}

const initialState: FeedbackState = {
  feedbackClicked: false,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setFeedbackClicked: (state) => {
      state.feedbackClicked = !state.feedbackClicked;
    },
    resetFeedbackClicked: (state) => {
      state.feedbackClicked = false;
    },
  },
});

export const { setFeedbackClicked, resetFeedbackClicked } =
  feedbackSlice.actions;
export const feedbackReducer = feedbackSlice.reducer;
