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
  // gradEnabled: 관리자 챗봇 설정에서 대학원 답변을 끄면 false → 스위치를 숨기고 학부로만 (기억해 둔 값은 그대로 둬서 다시 켜면 돌아옴)
  initialState: { value: loadProgram() as Program, gradEnabled: true },
  reducers: {
    setProgram(state, action: PayloadAction<Program>) {
      state.value = action.payload;
      try {
        localStorage.setItem(PROGRAM_KEY, action.payload);
      } catch {}
    },
    setGradEnabled(state, action: PayloadAction<boolean>) {
      state.gradEnabled = action.payload;
      state.value = action.payload ? loadProgram() : 'undergraduate';
    },
  },
});

export const { setProgram, setGradEnabled } = programSlice.actions;
export const programReducer = programSlice.reducer;
