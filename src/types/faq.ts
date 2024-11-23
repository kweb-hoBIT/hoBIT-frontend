export type RateFaqRequest = {
  faq_id: number;
  rating: number;
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

export type Question = {
  faq_id: number;
  question_ko: string;
  question_en: string;
};

export type AllQuestionsRequest = {};

export type AllQuestionsResponse = {
  questions: Question[];
};
