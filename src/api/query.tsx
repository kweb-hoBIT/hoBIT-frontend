import apiClient, { API_ENDPOINT, getSessionId } from './apiClient';
import { RateFaqRequest } from '../types/faq';
import { DirectUserFeedbacksRequest } from '../types/feedback';
import { GetSeniorFaqByIdRequest } from '../types/seniorFaq';

/**
 * 스트리밍 질문 — 답변을 쓰는 동안 onDelta로 글자 조각을 전달하고, 끝나면 /question과 같은 형식의 최종 응답을 반환.
 * 인사·프로필 질문처럼 바로 끝나는 응답은 onDelta 호출 없이 최종 응답만 온다.
 */
export const sendQuestionStream = async (
	question: string,
	language: string,
	onDelta: (text: string) => void,
	onMeta?: (meta: { style?: string }) => void,
	options?: { standalone?: boolean }  // standalone: 추천 칩 질문 (앞 대화와 합쳐 검색하지 않음)
) => {
	const res = await fetch(`${API_ENDPOINT}/question/stream`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Session-ID': getSessionId() },
		credentials: 'include',
		body: JSON.stringify({ question, language, standalone: Boolean(options?.standalone) }),
	});
	if (!res.ok || !res.body) throw new Error(`stream request failed: ${res.status}`);

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let final: any = null;
	for (;;) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		let sep: number;
		while ((sep = buffer.indexOf('\n\n')) >= 0) {
			const raw = buffer.slice(0, sep);
			buffer = buffer.slice(sep + 2);
			const event = /^event: (.*)$/m.exec(raw)?.[1]?.trim();
			const data = /^data: (.*)$/m.exec(raw)?.[1];
			if (!event || data === undefined) continue;
			if (event === 'delta') onDelta(JSON.parse(data).text ?? '');
			else if (event === 'meta') onMeta?.(JSON.parse(data));
			else if (event === 'done') final = JSON.parse(data);
		}
	}
	if (!final) throw new Error('stream ended without final response');
	return final;
};

export const sendQuestion = async (question: string, language: string) => {
	try {
		const response = await apiClient.post('/question', {
			question,
			language,
		});
		return response.data;
	} catch (error: any) {
		console.error('Error while sending question:', error);
		throw error.response?.data || error.message;
	}
};

export const getAllQuestions = async () => {
	try {
		const response = await apiClient.get('/all_questions');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching all questions:', error);
		throw error.response?.data || error.message;
	}
};

export type KeywordRule = {
	keyword: string;
	synonyms: string[];
	pinned: { faq_id: number; question_ko: string; question_en: string }[];
};

/** 관리자가 등록한 키워드 규칙 (대표 키워드·연관 단어·고정 FAQ) — 실패하면 규칙 없이 */
let keywordRulesPromise: Promise<KeywordRule[]> | null = null;
export const getKeywordRules = (): Promise<KeywordRule[]> => {
	if (!keywordRulesPromise) {
		keywordRulesPromise = apiClient
			.get('/keyword_rules')
			.then((r) => (Array.isArray(r.data?.rules) ? r.data.rules : []))
			.catch(() => {
				// 실패하면 1분 동안은 규칙 없이 (입력창이 열릴 때마다 다시 요청하지 않게)
				window.setTimeout(() => {
					keywordRulesPromise = null;
				}, 60_000);
				return [];
			});
	}
	return keywordRulesPromise;
};

export const rateFAQ = async ({
  id,
  user_question,
  faq_id,
  rating,
  feedback_reason,
  feedback_detail,
  language,
}: RateFaqRequest) => {
  try {
    const response = await apiClient.post('/rate', {
      id,
      user_question,
      faq_id,
      rate: rating,
      feedback_reason,
      feedback_detail,
      language,
    });
    return response;
  } catch (error: any) {
    console.error('Error while rating FAQ:', error);
    throw error.response?.data || error.message;
  }
};

export const directUserFeedback = async ({
	feedback_detail,
	language,
}: DirectUserFeedbacksRequest) => {
	try {
		const response = await apiClient.post('/direct_user_feedback', {
			feedback_detail,
			language,
		});
		return response;
	} catch (error: any) {
		console.error('Error while direct user feedback FAQ:', error);
		throw error.response?.data || error.message;
	}
};

export const postFaqUserFeedback = async ({
	feedback_detail,
	language,
}: DirectUserFeedbacksRequest) => {
	try {
		const response = await apiClient.post('/direct_user_feedback', {
			feedback_detail,
			language,
		});
		return response;
	} catch (error: any) {
		console.error('Error while direct user feedback FAQ:', error);
		throw error.response?.data || error.message;
	}
};

// moderate 관련 로직 추가
export const moderateContent = async (content: string) => {
  try {
    const response = await apiClient.post('/moderate', {
      content
    });
    return response.data; // {allowed: boolean, reason: object}
  } catch (error: any){
    console.error('Error during moderation: ', error);
    throw error.response?.data || error.message;
  }
};

export const getAllFAQs = async () => {
	try {
		const response = await apiClient.get('/all_faqs');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching all faqs:', error);
		throw error.response?.data || error.message;
	}
};

export const getFAQs = async () => {
	try {
		const response = await apiClient.get('/top_faqs');
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching top faqs:', error);
		throw error.response?.data || error.message;
	}
};

export const getSeniorFAQById = async ({ id }: GetSeniorFaqByIdRequest) => {
	try {
		const response = await apiClient.get('/senior_faq', {
			params: {
				id,
			},
		});
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching senior faq by id:', error);
		throw error.response?.data || error.message;
	}
};

export const getAllSeniorFAQs = async () => {
  try {
    const response = await apiClient.get('/all_senior_faqs');
    return response.data;
  } catch (error: any) {
    console.error('Error while fetching all senior faqs questions:', error);
    throw error.response?.data || error.message;
  }
};

export type ProfileData = {
	department?: string;
	major_type?: string;
	grade?: number;
	admission_year?: number;
	student_status?: string;
	language?: string;
};

export const saveProfile = async (data: ProfileData) => {
	try {
		const response = await apiClient.post('/profile', data);
		return response.data;
	} catch (error: any) {
		console.error('Error while saving profile:', error);
		throw error.response?.data || error.message;
	}
};

export const getFaqById = async (id: number) => {
	try {
		const response = await apiClient.get('/faq', { params: { id } });
		return response.data;
	} catch (error: any) {
		console.error('Error while fetching faq by id:', error);
		throw error.response?.data || error.message;
	}
};

export const sendChat = async (message: string, language: 'KO' | 'EN') => {
  try {
    const response = await apiClient.post('/chat', {
      message,
      language,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error while sending chat message:', error);
    throw error.response?.data || error.message;
  }
};

export type StoredProfile = {
	profile: Record<'department' | 'major_type' | 'grade' | 'admission_year' | 'student_status', string | number | null>;
	ttl_seconds: number | null;
};

/** 화면의 '내 정보' — 저장된 프로필과 남은 보관 시간 */
export const getProfile = async (): Promise<StoredProfile> => {
	const response = await apiClient.get('/profile');
	return response.data;
};

/** 프로필 삭제 — field를 주면 그 항목만, 없으면 전체 (대화 기록 포함) */
export const deleteProfile = async (field?: string) => {
	const response = await apiClient.delete('/profile', { params: field ? { field } : {} });
	return response.data;
};

// 대화 시작 화면 추천 — 페이지당 한 번만 요청 (홈 버튼으로 시작 화면을 여러 번 그려도 재요청하지 않음)
let startRecommendations: Promise<any[]> | null = null;
export const getStartRecommendations = (): Promise<any[]> => {
	if (!startRecommendations) {
		startRecommendations = apiClient
			.get('/recommend/start')
			.then((r) => r.data.items ?? [])
			.catch(() => {
				startRecommendations = null;
				return [];
			});
	}
	return startRecommendations;
};

/** 행정실 FAQ를 메뉴·칩으로 바로 열었을 때 — 그 FAQ 주제 기준 다음 추천 */
export const getRecommendationsAfterFaq = async (id: number): Promise<any[]> => {
	try {
		const response = await apiClient.post('/recommend/after-faq', { id });
		return response.data.items ?? [];
	} catch {
		return [];
	}
};
