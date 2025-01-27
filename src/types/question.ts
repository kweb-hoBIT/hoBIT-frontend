import { Faq } from './faq';

export type QuestionRequest = {
	question: string;
	language: QuestionLanguage;
};

export type QuestionResponse = { faq: Faq[]; is_greet: boolean };

export type FeedbackLanguage = 'ko' | 'en';

export type QuestionLanguage = 'KO' | 'EN';
