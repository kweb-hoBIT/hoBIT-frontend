import { API_ENDPOINT, getSessionId } from './apiClient';
import { loadProgram } from '../redux/programSlice';

/**
 * 스트리밍 질문 (중지 가능) — query.tsx의 sendQuestionStream과 같은 동작에 signal만 더함.
 * '답변 중지'를 누르면 signal로 fetch를 끊음 → 백엔드가 연결 끊김을 보고 RAG 요청도 끊어 LLM이 계속 쓰지 않게.
 * 끊기면 AbortError로 reject (isAbortError로 구분)
 */
export const sendQuestionStream = async (
	question: string,
	language: string,
	onDelta: (text: string) => void,
	onMeta?: (meta: { style?: string }) => void,
	options?: { standalone?: boolean; signal?: AbortSignal }  // standalone: 추천 칩 질문 (앞 대화와 합쳐 검색하지 않음)
) => {
	const res = await fetch(`${API_ENDPOINT}/question/stream`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Session-ID': getSessionId() },
		credentials: 'include',
		body: JSON.stringify({ question, language, standalone: Boolean(options?.standalone), program: loadProgram() }),
		signal: options?.signal,
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

export const isAbortError = (err: unknown) => (err as { name?: string } | null)?.name === 'AbortError';
