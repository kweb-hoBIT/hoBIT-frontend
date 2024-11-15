// inputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
  isEmpty: boolean;
  sentValue: string;
}

const initialState: InputState = {
  isEmpty: true,
  sentValue: '',
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
      state.isEmpty = true;
    },
    clearSentValue: (state) => {
      state.sentValue = '';
    },
  },
});

export const { setIsEmpty, sendInputValue, clearSentValue } =
  inputSlice.actions;
export const inputReducer = inputSlice.reducer;
