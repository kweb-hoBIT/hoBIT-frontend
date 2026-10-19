/**
 * 담당자에게 넘길 최근 챗봇 대화 (질문·답변 요약) — 학생이 같은 걸 다시 설명하지 않게
 * Chatting이 답변이 끝날 때마다 기록, 채팅을 시작할 때 최근 6개를 보냄. 이 탭 메모리에만 있음
 */
type Exchange = { q: string; a: string };
let recent: Exchange[] = [];

export function recordExchanges(items: Exchange[]) {
  recent = items.filter((x) => x.q).slice(-6).map((x) => ({ q: x.q.slice(0, 300), a: x.a.slice(0, 600) }));
}

export function getRecentExchanges(): Exchange[] {
  return recent;
}
