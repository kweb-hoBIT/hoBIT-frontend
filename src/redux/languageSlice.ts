import { createSlice } from '@reduxjs/toolkit';

interface LanguageState {
  isKorean: boolean;
}

const initialState: LanguageState = {
  isKorean: true,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setKorean(state) {
      state.isKorean = true;
    },
    setEnglish(state) {
      state.isKorean = false;
    },
    toggleLanguage(state) {
      state.isKorean = !state.isKorean;
    },
  },
});

export const { setKorean, setEnglish, toggleLanguage } = languageSlice.actions;
export const languageReducer = languageSlice.reducer;
