/**
 * 띄어쓰기 없는 긴 이름의 줄바꿈 자리 — "송현스퀘어(애기능학생회관)" → 괄호 앞에서 나뉘도록 보이지 않는 공백(ZWSP) 삽입.
 * 단어 단위 줄바꿈(break-keep)에서는 띄어쓰기가 없으면 줄을 바꿀 곳이 없어 칸 밖으로 넘쳤음.
 */
export const softBreak = (text: string): string => text.replace(/\s*([([])/g, '​$1').replace(/([·/])/g, '$1​');
