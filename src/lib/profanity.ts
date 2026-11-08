import { once } from './idle';

// 욕설 검사기(korcen)는 단어 목록이 커서 첫 화면 번들에서 빼고, 처음 검사할 때(또는 입력칸에 들어갈 때) 받음
export const loadKorcen = once(() => import('korcen'));

/** 한국어 욕설이 있으면 true — 검사기를 못 받으면 통과시키고 서버 검사(moderation)에 맡김 */
export const hasKoreanProfanity = async (text: string): Promise<boolean> => {
  try {
    const { check } = await loadKorcen();
    return check(text);
  } catch {
    return false;
  }
};
