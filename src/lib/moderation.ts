import type { Dispatch } from '@reduxjs/toolkit';

import { appAlert } from '../components/ui/Dialog';
import { setSuspendedUntil } from '../redux/moderationSlice';
import { Moderation } from '../types/question';

const REASON: Record<string, { ko: string; en: string }> = {
  offensive: { ko: '욕설이나 비하 표현이 있었어요.', en: 'Your question contained rude or offensive language.' },
  rate_limit: { ko: '짧은 시간에 질문이 너무 많이 들어왔어요.', en: 'Too many questions were sent in a short time.' },
  attack: { ko: '처리할 수 없는 입력이 들어 있었어요.', en: 'Your input contained content that can’t be processed.' },
  oversized: { ko: '질문이 너무 길었어요.', en: 'Your question was far too long.' },
};

/** 남은 시간 "9:41" / "1:05:09" */
export const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

/**
 * 질문 응답의 moderation 처리 — 말풍선(서버 안내 문구)은 평소처럼 보이고, 여기서는 눈에 띄는 알림·입력 잠금만.
 *  warning   → 경고 알림창 (n/3)
 *  suspended → 입력창 잠금 (풀리는 시각 기억) + 처음 정지될 때 알림창
 *  blocked   → 말풍선만 (개인 AI 요청·긴 질문 등)
 */
export function applyModeration(
  moderation: Moderation | undefined,
  dispatch: Dispatch,
  isKorean: boolean,
  alreadySuspended: boolean
) {
  if (!moderation) return;
  if (moderation.level === 'warning') {
    const r = REASON[moderation.reason];
    appAlert(
      isKorean
        ? `⚠️ 경고 ${moderation.strikes}/3\n${r?.ko ?? ''}\n같은 일이 3번 되면 잠시 질문이 제한돼요.`
        : `⚠️ Warning ${moderation.strikes}/3\n${r?.en ?? ''}\nAfter 3 warnings, questions will be temporarily suspended.`
    );
  } else if (moderation.level === 'suspended' && moderation.retry_after_sec) {
    // 서버가 알려 준 남은 초로 계산 — 기기 시계가 서버와 달라도 맞게
    const until = Date.now() + moderation.retry_after_sec * 1000;
    dispatch(setSuspendedUntil(until));
    if (!alreadySuspended) {
      const left = formatCountdown(until - Date.now());
      appAlert(
        isKorean
          ? `잠시 이용이 제한됐어요.\n부적절한 이용이 반복돼 ${left} 동안 질문할 수 없어요.`
          : `Your access is temporarily suspended.\nDue to repeated misuse, you can’t ask questions for ${left}.`
      );
    }
  }
}
