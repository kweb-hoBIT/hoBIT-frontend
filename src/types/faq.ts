export type RateFaqRequest = {
  faq_id: string;
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

export default Faq;
