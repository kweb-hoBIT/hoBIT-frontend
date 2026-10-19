// Chat API 요청/응답 타입 정의

export interface ChatRequest {
  message: string;
  language: 'KO' | 'EN';
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
}
