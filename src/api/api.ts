import JSONbig from 'json-bigint';
import { envs } from '../envs';
import {
	ApiResponse,
	HobitApiRequest,
	HobitApiResponse,
	jsonParseFailPayload,
} from '../types/api';

const endpoint = `${envs.HOBIT_BACKEND_ENDPOINT!}/api/v0`;

/**
 * 브라우저 세션 단위로 고유한 세션 ID를 반환합니다.
 * sessionStorage에 저장하여 탭을 닫으면 초기화됩니다 (대화 히스토리 유지 범위).
 */
function getOrCreateSessionId(): string {
	const KEY = 'hobit_session_id';
	let id = sessionStorage.getItem(KEY);
	if (!id) {
		id = crypto.randomUUID();
		sessionStorage.setItem(KEY, id);
	}
	return id;
}

export async function hobitApi<
	T extends HobitApiRequest,
	R extends { type: T['type'] } & HobitApiResponse,
>(req: T, method: 'GET' | 'POST'): Promise<ApiResponse<R>> {
	const headers: Record<string, string> = {
		'Content-type': 'application/json',
		'x-session-id': getOrCreateSessionId(),
	};

	const path = req.type;

	let resp;
	try {
		if (method === 'GET') {
			const queryParams = new URLSearchParams(
				req as Record<string, string>
			).toString();
			resp = await fetch(`${endpoint}/${path}?${queryParams}`, {
				method: 'GET',
				mode: 'cors',
				headers,
			});
		} else {
			resp = await fetch(`${endpoint}/${path}`, {
				method: 'POST',
				mode: 'cors',
				headers,
				body: JSONbig.stringify(req),
			});
		}
	} catch (err) {
		return {
			error: {
				code: 'FETCH_ERROR',
				msg: String(err),
				note: null,
			},
			payload: null,
		};
	}

	try {
		const json = await resp.json();
		return { error: null, payload: json };
	} catch (err) {
		return { error: jsonParseFailPayload, payload: null };
	}
}
