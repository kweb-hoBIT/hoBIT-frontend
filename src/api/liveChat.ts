import { io, Socket } from 'socket.io-client';
import { envs } from '../envs';

/**
 * 실시간 채팅 API (hoBIT-backend /api/v0/chat)
 * - 학생 토큰: 학교 메일 인증 후 12시간, 이 기기에만 저장 (새로고침해도 채팅이 이어짐)
 * - 메시지·입력 중·채팅 시작 알림은 소켓, 나머지는 HTTP
 */
export const BACKEND = envs.HOBIT_BACKEND_ENDPOINT ?? '';
const BASE = `${BACKEND}/api/v0/chat`;
const TOKEN_KEY = 'hobit-chat-token';

export type ChatMode = 'staff' | 'senior';
export type ChatStatus = {
	mode: ChatMode;
	open: boolean;
	reason: 'open' | 'away' | 'holiday' | 'weekend' | 'lunch' | 'before' | 'after';
	hours: { today: { start: string; end: string } | null; lunch: { start: string; end: string } | null; period: string } | null;
	officeEmail: string;
	emailVerification: boolean; // false면 개발 모드 (코드 인증 생략)
};
export type Attachment = { id: string; name: string; mime: string; size: number; width: number | null; height: number | null; url: string | null };
export type ChatMessage = {
	id: number;
	sessionId: string;
	sender: 'student' | 'agent' | 'system';
	senderName: string | null;
	body: string;
	createdAt: string;
	attachment: Attachment | null;
	translation: { text: string; lang: string } | null; // 자동 번역 (학생이 읽는 언어)
	editedAt?: string | null; // 보낸 사람이 고침
	removed?: boolean; // 보낸 사람이 지움 (내용 없음)
};
/** 보낸 뒤 이 시간 안에만 내 메시지 수정·삭제 (서버도 같은 기준) */
export const EDIT_WINDOW_MS = 5 * 60 * 1000;
export type ChatSession = {
	id: string;
	mode: ChatMode;
	status: 'waiting' | 'active' | 'closed';
	assignedName: string | null;
	startedAt: string | null; // 담당자가 연결된 시각 (없으면 연결 전에 끝난 채팅)
	profile?: Record<string, string> | null; // 채팅 시작 때 입력한 학생 정보 (서버에 저장된 그대로)
	rating: number | null;
	closedBy: 'student' | 'agent' | 'system' | null;
};

export class ChatApiError extends Error {
	constructor(
		readonly code: string,
		message: string,
		readonly status: number
	) {
		super(message);
	}
}

// ── 토큰 ─────────────────────────────────────────────────
export function getToken(): { token: string; email: string } | null {
	try {
		const raw = localStorage.getItem(TOKEN_KEY);
		if (!raw) return null;
		const v = JSON.parse(raw) as { token: string; email: string; exp: number };
		if (Date.now() > v.exp) {
			localStorage.removeItem(TOKEN_KEY);
			return null;
		}
		return { token: v.token, email: v.email };
	} catch {
		return null;
	}
}

export function saveToken(token: string, email: string, expiresInSec: number) {
	try {
		localStorage.setItem(TOKEN_KEY, JSON.stringify({ token, email, exp: Date.now() + (expiresInSec - 60) * 1000 }));
	} catch {
		/* 저장 못 하면 이번 화면에서만 */
	}
}

export function clearToken() {
	try {
		localStorage.removeItem(TOKEN_KEY);
	} catch {
		/* noop */
	}
}

// ── HTTP ─────────────────────────────────────────────────
async function call<T>(method: string, path: string, body?: unknown, auth = false): Promise<T> {
	const t = auth ? getToken() : null;
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: {
			...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
			...(t ? { Authorization: `Bearer ${t.token}` } : {}),
		},
		body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok || json.ok === false) {
		if (res.status === 401) clearToken();
		throw new ChatApiError(json.error ?? 'error', json.message ?? '', res.status);
	}
	return json as T;
}

export const chatApi = {
	status: (mode: ChatMode) => call<ChatStatus>('GET', `/status?mode=${mode}`),
	sendCode: (email: string) => call<{ ok: true }>('POST', '/email/code', { email }),
	verify: async (email: string, code: string) => {
		const r = await call<{ token: string; email: string; expiresIn: number }>('POST', '/email/verify', { email, code });
		saveToken(r.token, r.email, r.expiresIn);
		return r;
	},
	/** 개발 모드(서버 CHAT_SKIP_EMAIL_VERIFY=1)에서만 — 코드 없이 학교 메일로 바로 */
	devLogin: async (email: string) => {
		const r = await call<{ token: string; email: string; expiresIn: number }>('POST', '/email/dev-login', { email });
		saveToken(r.token, r.email, r.expiresIn);
		return r;
	},
	me: () =>
		call<{ email: string; session: ChatSession | null; messages: ChatMessage[]; position?: number }>('GET', '/me', undefined, true),
	start: (body: { mode: ChatMode; language: 'KO' | 'EN'; profile: unknown; botContext: unknown }) =>
		call<{ session: ChatSession; messages: ChatMessage[]; position: number }>('POST', '/sessions', body, true),
	/** 진행 중인 채팅 종료 (다른 종류 채팅으로 바꿀 때) */
	close: (sessionId: string) => call('POST', `/sessions/${sessionId}/close`, undefined, true),
	rate: (sessionId: string, rating: number, comment: string) => call('POST', `/sessions/${sessionId}/rating`, { rating, comment }, true),
	offlineMail: (subject: string, body: string) => call('POST', '/offline-email', { subject, body }, true),
	upload: (sessionId: string, file: File) => {
		const form = new FormData();
		form.append('file', file);
		return call<{ message: ChatMessage }>('POST', `/sessions/${sessionId}/attachments`, form, true);
	},
	fileLink: (attachmentId: string) => call<{ url: string }>('GET', `/attachments/${attachmentId}/link`, undefined, true),
};

/** 서버가 준 파일 경로(/api/v0/chat/files/…)를 전체 주소로 */
export const fileUrl = (path: string) => `${BACKEND}${path}`;

export function connectChat(token: string): Socket {
	return io(BACKEND || window.location.origin, {
		path: '/api/v0/chat/socket',
		auth: { kind: 'student', token },
		transports: ['websocket', 'polling'],
	});
}
