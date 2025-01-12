import { QuestionLanguage } from './question';

export type RateFaqRequest = {
  faq_id: number;
  user_question: string;
  rating: number;
  language: QuestionLanguage;
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

export type SeniorFaq = {
  senior_faq_id: number;
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
}[];

export const seniorFaqs: SeniorFaq = [
  {
    senior_faq_id: 1,
    maincategory_ko: '메인카테고리1',
    maincategory_en: 'Category1',
    subcategory_ko: '서브카테고리1',
    subcategory_en: 'Subcategory1',
    detailcategory_ko: '세부카테고리2',
    detailcategory_en: 'DetailCategory2',
    answer_ko: [
      {
        title: '질문1',
        answer: '답변1',
        url: 'https://example.com/ko',
        email: 'example_ko@example.com',
        phone: '010-1234-5678',
        image: 'https://example.com/image_ko.jpg',
        map: {
          latitude: '37.589169',
          longitude: '127.033529',
        },
      },
    ],
    answer_en: [
      {
        title: 'Question1',
        answer: 'Answer1',
        url: 'https://example.com/en',
        email: 'example_en@example.com',
        phone: '+82-10-1234-5678',
        image: 'https://example.com/image_en.jpg',
        map: {
          latitude: '37.5665',
          longitude: '126.9780',
        },
      },
    ],
    manager: '관리자1',
    created_at: '2025-01-12T10:00:00Z',
    updated_at: '2025-01-12T10:00:00Z',
  },
  {
    senior_faq_id: 2,
    maincategory_ko: '메인카테고리1',
    maincategory_en: 'Category1',
    subcategory_ko: '서브카테고리2',
    subcategory_en: 'Subcategory2',
    detailcategory_ko: '세부카테고리2',
    detailcategory_en: 'DetailCategory2',
    answer_ko: [
      {
        title: '질문2',
        answer: '답변2',
        url: 'https://example2.com/ko',
        email: 'example2_ko@example.com',
        phone: '010-2345-6789',
        image: 'https://example2.com/image_ko.jpg',
        map: {
          latitude: '35.6895',
          longitude: '139.6917',
        },
      },
    ],
    answer_en: [
      {
        title: 'Question2',
        answer: 'Answer2',
        url: 'https://example2.com/en',
        email: 'example2_en@example.com',
        phone: '+82-10-2345-6789',
        image: 'https://example2.com/image_en.jpg',
        map: {
          latitude: '35.6895',
          longitude: '139.6917',
        },
      },
    ],
    manager: '관리자2',
    created_at: '2025-01-12T11:00:00Z',
    updated_at: '2025-01-12T11:00:00Z',
  },
  {
    senior_faq_id: 3,
    maincategory_ko: '메인카테고리3',
    maincategory_en: 'Category3',
    subcategory_ko: '서브카테고리3',
    subcategory_en: 'Subcategory3',
    detailcategory_ko: '',
    detailcategory_en: '',
    answer_ko: [
      {
        title: '질문3',
        answer: '답변3',
        url: 'https://example3.com/ko',
        email: 'example3_ko@example.com',
        phone: '010-3456-7890',
        image: 'https://example3.com/image_ko.jpg',
        map: {
          latitude: '48.8566',
          longitude: '2.3522',
        },
      },
    ],
    answer_en: [
      {
        title: 'Question3',
        answer: 'Answer3',
        url: 'https://example3.com/en',
        email: 'example3_en@example.com',
        phone: '+82-10-3456-7890',
        image: 'https://example3.com/image_en.jpg',
        map: {
          latitude: '48.8566',
          longitude: '2.3522',
        },
      },
    ],
    manager: '관리자3',
    created_at: '2025-01-12T12:00:00Z',
    updated_at: '2025-01-12T12:00:00Z',
  },
  {
    senior_faq_id: 4,
    maincategory_ko: '메인카테고리4',
    maincategory_en: 'Category4',
    subcategory_ko: '서브카테고리4',
    subcategory_en: 'Subcategory4',
    detailcategory_ko: '세부카테고리4',
    detailcategory_en: 'DetailCategory4',
    answer_ko: [
      {
        title: '질문4',
        answer: '답변4',
        url: 'https://example4.com/ko',
        email: 'example4_ko@example.com',
        phone: '010-4567-8901',
        image: 'https://example4.com/image_ko.jpg',
        map: {
          latitude: '51.5074',
          longitude: '-0.1278',
        },
      },
    ],
    answer_en: [
      {
        title: 'Question4',
        answer: 'Answer4',
        url: 'https://example4.com/en',
        email: 'example4_en@example.com',
        phone: '+82-10-4567-8901',
        image: 'https://example4.com/image_en.jpg',
        map: {
          latitude: '51.5074',
          longitude: '-0.1278',
        },
      },
    ],
    manager: '관리자4',
    created_at: '2025-01-12T13:00:00Z',
    updated_at: '2025-01-12T13:00:00Z',
  },
];
