import { createSlice } from '@reduxjs/toolkit';

const SeniorFaqIdSlice = createSlice({
  name: 'seniorFaqId',
  initialState: {
    seniorFaqId: null,
  },
  reducers: {
    setSeniorFaqId: (state, action) => {
      state.seniorFaqId = action.payload;
    },
    clearSeniorFaqId: (state) => {
      state.seniorFaqId = null;
    },
  },
});

export const { setSeniorFaqId, clearSeniorFaqId } = SeniorFaqIdSlice.actions;
export const SeniorFaqIdReducer = SeniorFaqIdSlice.reducer;
