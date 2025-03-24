import { FeedbackLanguage } from './question';

export type RateFaqRequest = {
  id: number;
  user_question: string;
  faq_id: number;
  rating: -1 | 1 | 0;
  feedback_reason: string;
  feedback_detail: string;
  language: FeedbackLanguage;
};

export type RateFaqResponse = {
  success: boolean;
};

export type Faq = {
  id: number;
  maincategory_ko: string;
  maincategory_en: string;
  subcategory_ko: string;
  subcategory_en: string;
  question_ko: string;
  question_en: string;
  answer_ko: string;
  answer_en: string;
  manager: string;
  created_by: number | null;
  updated_by: number | null;
};

export type FaqAnswer = FaqCard[];

export type FaqCard = {
  answer: string;
  url: string;
  email: string;
  phone: string;
};

export type Question = {
  faq_id: number;
  question_ko: string;
  question_en: string;
};

export type AllQuestionsRequest = {};

export type AllQuestionsResponse = {
  questions: Question[];
};

export type AllFaqsRequest = {};

export type AllFaqsResponse = {
  faqs: Faq[];
};

export type SeniorFAQ = {
  id: number;
  maincategory_ko: string;
  maincategory_en: string;
  subcategory_ko: string;
  subcategory_en: string;
  detailcategory_ko: string;
  detailcategory_en: string;
  answer_ko: {
    title: string;
    answer: string;
    url: string;
    email: string;
    phone: string;
    image: string;
    map: {
      latitude: string;
      longitude: string;
    };
  }[];
  answer_en: {
    title: string;
    answer: string;
    url: string;
    email: string;
    phone: string;
    image: string;
    map: {
      latitude: string;
      longitude: string;
    };
  }[];
  manager: string;
  created_at: string;
  updated_at: string;
};
