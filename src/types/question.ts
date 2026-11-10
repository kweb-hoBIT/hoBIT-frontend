import { Faq } from './faq';

export type QuestionRequest = {
	question: string;
	language: QuestionLanguage;
};

export type QuestionResponse = { faq: Faq[]; is_greet: boolean; id: number };

export type FeedbackLanguage = 'ko' | 'en';

export type QuestionLanguage = 'KO' | 'EN';

// 질문 남용 안내 (서버 middleware/abuse.ts) — 경고·정지·차단 응답에만 붙음
export type Moderation = {
	level: 'warning' | 'suspended' | 'blocked';
	reason: 'offensive' | 'rate_limit' | 'attack' | 'oversized' | 'too_long' | 'off_topic' | 'suspended';
	strikes: number;
	until?: string;
	retry_after_sec?: number;
};
