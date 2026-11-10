// inputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
	isEmpty: boolean;
	sentValue: string;
	liveValue: string;
	sent: boolean;
	directFaqId: number | null;  // FAQ 직접 클릭 시 ID
	standalone: boolean;  // 추천 칩에서 보낸 질문 — 그 자체로 완결된 질문이라 앞 대화와 합쳐 검색하지 않음
	isLoading: boolean;
	stopSeq: number;  // '답변 중지'를 누를 때마다 1씩 — Chatting이 보고 진행 중인 요청을 끊음

	// out of ctx
	id: number;
}

const initialState: InputState = {
	isEmpty: true,
	sentValue: '',
	liveValue: '',
	sent: false,
	directFaqId: null,
	standalone: false,
	isLoading: false,
	stopSeq: 0,

	id: -1,
};

const inputSlice = createSlice({
	name: 'input',
	initialState,
	reducers: {
		setIsEmpty: (state, action: PayloadAction<boolean>) => {
			state.isEmpty = action.payload;
		},
		// 질문 보내기 3종 — 모든 버튼·칩·입력창이 여기를 거침. 바로 isLoading을 켜서 같은 순간 두 번 눌러도 한 번만 보냄
		sendInputValue: (state, action: PayloadAction<string>) => {
			if (state.isLoading || !action.payload.trim()) return;  // 답변 중에는 새 질문을 받지 않음 (칩을 눌러 LLM이 두 번 불리던 문제)
			state.isLoading = true;
			state.sentValue = action.payload;
			state.liveValue = '';
			state.isEmpty = true;
			state.sent = true;
			state.directFaqId = null;
			state.standalone = false;
		},
		// 추천 칩 클릭 (행정실 FAQ가 없는 칩) — 질문으로 보내되 "칩에서 보냄" 표시
		sendRecommendedQuestion: (state, action: PayloadAction<string>) => {
			if (state.isLoading || !action.payload.trim()) return;  // 답변 중에는 새 질문을 받지 않음 (칩을 눌러 LLM이 두 번 불리던 문제)
			state.isLoading = true;
			state.sentValue = action.payload;
			state.liveValue = '';
			state.isEmpty = true;
			state.sent = true;
			state.directFaqId = null;
			state.standalone = true;
		},
		sendFaqById: (state, action: PayloadAction<{ id: number; query: string }>) => {
			if (state.isLoading || !action.payload.query.trim()) return;  // 답변 중에는 새 질문을 받지 않음 (칩을 눌러 LLM이 두 번 불리던 문제)
			state.isLoading = true;
			state.sentValue = action.payload.query;
			state.liveValue = '';
			state.isEmpty = true;
			state.sent = true;
			state.directFaqId = action.payload.id;
		},
		clearSent: (state) => {
			state.sent = false;
			state.directFaqId = null;
			state.standalone = false;
		},
		clearSentValue: (state) => {
			state.sentValue = '';
		},
		updateLiveValue: (state, action: PayloadAction<string>) => {
			state.liveValue = action.payload;
			state.isEmpty = action.payload === '';
		},

		setIsLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		// 답변 중지 — 요청을 끊고 화면을 정리하는 일은 요청을 가진 Chatting이 함 (여기선 신호만)
		requestStop: (state) => {
			if (state.isLoading) state.stopSeq += 1;
		},

		// ooc
		setId: (state, action: PayloadAction<number>) => {
			state.id = action.payload;
		},
	},
});

export const {
	setIsEmpty,
	sendInputValue,
	sendRecommendedQuestion,
	sendFaqById,
	clearSentValue,
	clearSent,
	updateLiveValue,
	setIsLoading,
	requestStop,
	setId,
} = inputSlice.actions;
export const inputReducer = inputSlice.reducer;
