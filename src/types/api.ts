import { RateFaqRequest, RateFaqResponse } from './faq';
import { GetQuestionRequest, GetQuestionResponse } from './question';

export type HobitApiRequest =
  | ({ type: 'get_question' } & GetQuestionRequest)
  | ({ type: 'rate_faq' } & RateFaqRequest);

export type HobitApiResponse =
  | ({ type: 'get_question' } & GetQuestionResponse)
  | ({ type: 'rate' } & RateFaqResponse);

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
