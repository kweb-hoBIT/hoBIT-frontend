import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 학부 / 대학원 스위치 (헤더) — 이 브라우저에 기억. 검색 범위·시작 화면 추천·FAQ 메뉴·마감 공지가 따라 바뀜
export type Program = 'undergraduate' | 'graduate';
export const PROGRAM_KEY = 'hobit-program';

export const loadProgram = (): Program => {
  try {
    return localStorage.getItem(PROGRAM_KEY) === 'graduate' ? 'graduate' : 'undergraduate';
  } catch {
    return 'undergraduate';
  }
};

const programSlice = createSlice({
  name: 'program',
  initialState: { value: loadProgram() as Program },
  reducers: {
    setProgram(state, action: PayloadAction<Program>) {
      state.value = action.payload;
      try {
        localStorage.setItem(PROGRAM_KEY, action.payload);
      } catch {}
    },
  },
});

export const { setProgram } = programSlice.actions;
export const programReducer = programSlice.reducer;
