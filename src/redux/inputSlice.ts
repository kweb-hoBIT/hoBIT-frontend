// inputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
  isEmpty: boolean;
  sentValue: string;
  liveValue: string;
  sent: boolean;
}

const initialState: InputState = {
  isEmpty: true,
  sentValue: '',
  liveValue: '',
  sent: false,
};

const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    setIsEmpty: (state, action: PayloadAction<boolean>) => {
      state.isEmpty = action.payload;
    },
    sendInputValue: (state, action: PayloadAction<string>) => {
      state.sentValue = action.payload;
      state.liveValue = '';
      state.isEmpty = true;
      state.sent = true;
    },
    clearSent: (state) => {
      state.sent = false;
    },
    clearSentValue: (state) => {
      state.sentValue = '';
    },
    updateLiveValue: (state, action: PayloadAction<string>) => {
      state.liveValue = action.payload;
      state.isEmpty = action.payload === '';
    },
  },
});

export const {
  setIsEmpty,
  sendInputValue,
  clearSentValue,
  clearSent,
  updateLiveValue,
} = inputSlice.actions;
export const inputReducer = inputSlice.reducer;
