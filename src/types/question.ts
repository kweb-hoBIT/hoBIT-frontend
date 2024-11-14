import Faq from './faq';

export type GetQuestionRequest = { question: string };

export type GetQuestionResponse = { faq: Faq };
