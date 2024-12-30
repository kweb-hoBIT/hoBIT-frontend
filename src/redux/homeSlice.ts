import { createSlice } from '@reduxjs/toolkit';

interface HomeState {
  homeClicked: boolean;
}

const initialState: HomeState = {
  homeClicked: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setHomeClicked: (state) => {
      state.homeClicked = !state.homeClicked;
    },
    resetHomeClicked: (state) => {
      state.homeClicked = false;
    },
  },
});

export const { setHomeClicked, resetHomeClicked } = homeSlice.actions;
export const homeReducer = homeSlice.reducer;
