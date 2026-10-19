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

	id: -1,
};

const inputSlice = createSlice({
	name: 'input',
	initialState,
	reducers: {
		setIsEmpty: (state, action: PayloadAction<boolean>) => {
			state.isEmpty = action.payload;
		},
		sendInputValue: (state, action: PayloadAction<string>) => {
			state.sentValue = action.payload;
			state.liveValue = '';
			state.isEmpty = true;
			state.sent = true;
			state.directFaqId = null;
			state.standalone = false;
		},
		// 추천 칩 클릭 (행정실 FAQ가 없는 칩) — 질문으로 보내되 "칩에서 보냄" 표시
		sendRecommendedQuestion: (state, action: PayloadAction<string>) => {
			state.sentValue = action.payload;
			state.liveValue = '';
			state.isEmpty = true;
			state.sent = true;
			state.directFaqId = null;
			state.standalone = true;
		},
		sendFaqById: (state, action: PayloadAction<{ id: number; query: string }>) => {
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
	setId,
} = inputSlice.actions;
export const inputReducer = inputSlice.reducer;
