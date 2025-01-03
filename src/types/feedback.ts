import { QuestionLanguage } from './question';

export type UserFeedbackReason =
  | '질문과 무관한 답변'
  | '중복된 답변'
  | '정보가 잘못됨'
  | '정보가 부족함'
  | '내용이 이해하기 어려움'
  | '기타';

export type DirectUserFeedbacksRequest = {
  feedback_detail: string;
  language: QuestionLanguage;
};

export type DirectUserFeedbacksResponse = {
  success: boolean;
};
