import {
  AllQuestionsRequest,
  AllQuestionsResponse,
  RateFaqRequest,
  RateFaqResponse,
} from './faq';
import { QuestionRequest, QuestionResponse } from './question';

export type HobitApiRequest =
  | ({ type: 'question' } & QuestionRequest)
  | ({ type: 'rate_faq' } & RateFaqRequest)
  | ({ type: 'all_questions' } & AllQuestionsRequest);

export type HobitApiResponse =
  | ({ type: 'question' } & QuestionResponse)
  | ({ type: 'rate' } & RateFaqResponse)
  | ({ type: 'all_questions' } & AllQuestionsResponse);

export type ApiResponse<P> = {
  error: ApiErrorPayload | null;
  payload: P | null;
};

export type ApiErrorPayload = {
  code: string;
  msg: string;
  note: string | null;
};

export const fetchErrorPayload: ApiErrorPayload = {
  code: 'FETCH_ERROR',
  msg: '',
  note: null,
};

export const jsonParseFailPayload: ApiErrorPayload = {
  code: 'JSON_PARSE_FAIL',
  msg: '',
  note: null,
};
