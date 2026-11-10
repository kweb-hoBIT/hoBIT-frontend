import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 질문 일시 정지 — 풀리는 시각(이 기기 시계 기준 ms)을 기억해 새로고침해도 입력창이 잠긴 채로 (실제 차단은 서버가 함)
export const SUSPENDED_KEY = 'hobit-suspended-until';

const loadUntil = (): number => {
  try {
    const v = Number(localStorage.getItem(SUSPENDED_KEY));
    return Number.isFinite(v) && v > Date.now() ? v : 0;
  } catch {
    return 0;
  }
};

const moderationSlice = createSlice({
  name: 'moderation',
  initialState: { suspendedUntil: loadUntil() },
  reducers: {
    setSuspendedUntil(state, action: PayloadAction<number>) {
      state.suspendedUntil = action.payload;
      try {
        if (action.payload > 0) localStorage.setItem(SUSPENDED_KEY, String(action.payload));
        else localStorage.removeItem(SUSPENDED_KEY);
      } catch {}
    },
  },
});

export const { setSuspendedUntil } = moderationSlice.actions;
export const moderationReducer = moderationSlice.reducer;
