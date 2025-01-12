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
  },
});

export const { setSeniorFaqId } = SeniorFaqIdSlice.actions;
export const SeniorFaqIdReducer = SeniorFaqIdSlice.reducer;
