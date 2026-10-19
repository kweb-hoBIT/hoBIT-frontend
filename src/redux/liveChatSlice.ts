import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** 실시간 채팅 창 — 열림 여부와 채팅 종류 (행정실 staff / 선배 senior) */
interface LiveChatState {
  open: boolean;
  mode: 'staff' | 'senior';
}

const initialState: LiveChatState = { open: false, mode: 'staff' };

const liveChatSlice = createSlice({
  name: 'liveChat',
  initialState,
  reducers: {
    openLiveChat: (state, action: PayloadAction<'staff' | 'senior'>) => {
      state.open = true;
      state.mode = action.payload;
    },
    closeLiveChat: (state) => {
      state.open = false;
    },
  },
});

export const { openLiveChat, closeLiveChat } = liveChatSlice.actions;
export const liveChatReducer = liveChatSlice.reducer;
