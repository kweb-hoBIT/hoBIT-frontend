import { Faq } from './faq';

export type QuestionRequest = { question: string };

export type QuestionResponse = { faq: Faq[] };
