import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Faq } from '../types/faq';

interface FAQCardState {
  isCardVisible: boolean;
  cardPayload: Faq | null;
}

const initialState: FAQCardState = {
  isCardVisible: false,
  cardPayload: null,
};

const faqCardSlice = createSlice({
  name: 'faqCard',
  initialState,
  reducers: {
    openCard(state, action: PayloadAction<Faq>) {
      state.isCardVisible = true;
      state.cardPayload = action.payload;
    },
    closeCard(state) {
      state.isCardVisible = false;
      state.cardPayload = null;
    },
  },
});

export const { openCard, closeCard } = faqCardSlice.actions;
export const faqCardReducer = faqCardSlice.reducer;
