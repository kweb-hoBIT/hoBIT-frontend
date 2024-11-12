import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
  value: string;
}

const initialState: InputState = {
  value: '',
};

const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearInputValue: (state) => {
      state.value = '';
    },
  },
});

export const { setInputValue, clearInputValue } = inputSlice.actions;
export const inputReducer = inputSlice.reducer;
