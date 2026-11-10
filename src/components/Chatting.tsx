import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HelloHobit from './chat/HelloHobit';
import GeneralResponse from './chat/GeneralResponse';
import FAQResponse from './chat/FAQResponse';
import AllCategoriesResponse from './chat/AllCategoriesResponse';
import SeniorResponse from './chat/SeniorResponse';
import Query from './chat/Query';
import { RootState } from '../redux/store';
import { Faq } from '../types/faq';
import { getAllQuestions, getFaqById, getRecommendationsAfterFaq } from '../api/query';
import { sendQuestionStream, isAbortError, ProgressStep } from '../api/questionStream';
import { setQuestions } from '../redux/questionsSlice';
import { resetHomeClicked } from '../redux/homeSlice';
import { clearSent } from '../redux/inputSlice';
import GreetResponse from './chat/GreetResponse';
import ProfileInput from './chat/ProfileInput';
import { setId, setIsLoading } from '../redux/inputSlice';
import { loadProgram, Program } from '../redux/programSlice';
import { THEME_CHANGE_EVENT } from './Header';
import RecChips, { RecItem } from './chat/RecChips';
import { recordExchanges } from '../lib/recentChat';
import { prefersReducedMotion } from '../lib/motion';
import { applyModeration } from '../lib/moderation';

// 맨 아래에서 이만큼 안이면 "바닥에 돌아왔다"로 보고 다시 따라감 / 이보다 위면 '아래로' 버튼을 보임
const RESUME_PX = 32;
const SHOW_DOWN_PX = 160;

// 천천히 보여 주기 박자
const TICK_MS = 32;              // 화면 갱신 간격
const FIRST_LIST_MS = 300;       // 첫 단계가 안 와도 이만큼 지나면 체크 목록을 띄움 (그 전엔 점 세 개)
const STEP_GAP_MS = 550;         // 단계 ✓ 사이 최소 간격 — 하나씩 읽히게
const BASE_CPS = 75;             // 기본 글 속도 (글자/초)
const CATCHUP_MAX_MS = 2500;     // 응답이 다 온 뒤 남은 글을 보여 주는 데 최대 이만큼
const COLLAPSE_AFTER_MS = 1600;  // 글이 나오기 시작하고 이만큼 뒤 체크 목록을 한 줄로 접음

type Pacer = {
  startedAt: number;
  steps: ProgressStep[];   // 받은 단계
  shownSteps: number;      // 화면에 보인 단계 수
  lastStepAt: number;
  stepsDirty: boolean;     // 이미 보인 단계의 내용이 바뀜
  target: string;          // 받은 글 전체
  shown: number;           // 보인 글자 수 (소수 — 박자마다 조금씩)
  textAt: number;          // 글을 보이기 시작한 시각 (0 = 아직)
  lastTick: number;
  finalPatch: Partial<ChatItem> | null; // 응답 끝 — 다 보여 준 뒤 적용할 최종 화면
  deadline: number;        // 남은 글을 이때까지 다 보여 줌
  // 마지막으로 화면에 반영한 값 (바뀐 것만 setState)
  cList: boolean; cSteps: number; cChars: number; cWritten: boolean; cCollapsed: boolean;
};

// 이모지(서로게이트 쌍) 중간에서 자르지 않게
const safeCut = (text: string, shown: number) => {
  let n = Math.min(text.length, Math.floor(shown));
  const c = text.charCodeAt(n - 1);
  if (n > 0 && n < text.length && c >= 0xd800 && c <= 0xdbff) n += 1;
  return n;
};


interface ChatItem {
  uid: string;  // 대화 항목 고유 번호 — 같은 질문을 여러 번 해도 해당 항목만 갱신
  query: string;
  response: Faq[];
  loading: boolean;
  flag: boolean;
  seniorMode: number;
  is_greet: boolean;
  is_able: boolean;
  is_freq: boolean;
  is_smalltalk: boolean;
  needs_profile: boolean;
  missing_fields: string[];
  followup_fields?: string[]; // 답변과 함께 보여주는 추가 정보 요청 (막지 않는 질문)
  streamText?: string;           // 스트리밍 중인 답변
  streamStyle?: string;          // senior면 스트리밍 말풍선도 선배 색
  progress?: ProgressStep[];     // 답변 전까지 끝난 단계 (체크 목록)
  progressWritten?: boolean;     // 글이 나오기 시작함 → '답변 정리 중…'을 ✓로
  progressCollapsed?: boolean;   // 체크 목록을 한 줄 요약으로 접음
  stopped?: boolean;             // '답변 중지'로 멈춤 — 그때까지 받은 글(streamText)만 남기고 멈췄다는 표시
  recommendations?: RecItem[];   // 답변 아래 "이어서 물어볼 만한 질문"
  initialSeniorFaqId?: number;
  notFound?: boolean;            // 자료에서 답을 못 찾음 → 우는 호빗
  audienceNote?: Program;        // 스위치와 다른 기준으로 답했을 때 (질문에 '대학원'·'학위논문' 같은 말이 있어서)
}

// 질문 속 말 때문에 스위치와 다른 기준(학부↔대학원)으로 답했으면 그 기준 — 답변 위에 작게 표시
const noteOf = (res: { audience?: string; audience_by?: string }): Program | undefined =>
  res.audience_by === 'question' && (res.audience === 'graduate' || res.audience === 'undergraduate') && res.audience !== loadProgram()
    ? res.audience
    : undefined;

let chatItemSeq = 0;
const nextUid = () => `chat-${Date.now()}-${chatItemSeq++}`;

const Chatting: React.FC = () => {
  const dispatch = useDispatch();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const sent = useSelector((state: RootState) => state.input.sent);
  const directFaqId = useSelector((state: RootState) => state.input.directFaqId);
  const standalone = useSelector((state: RootState) => state.input.standalone);
  const stopSeq = useSelector((state: RootState) => state.input.stopSeq);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  // 질문 일시 정지 중인지 — 이미 정지 중이면 알림창을 다시 띄우지 않음 (응답 처리 시점의 최신 값을 보려고 ref)
  const suspendedUntil = useSelector((state: RootState) => state.moderation.suspendedUntil);
  const suspendedRef = useRef(suspendedUntil);
  suspendedRef.current = suspendedUntil;
  const homeClicked = useSelector((state: RootState) => state.home.homeClicked);
  const feedbackClicked = useSelector(
    (state: RootState) => state.feedback.feedbackClicked
  );
  const seniorFaqId = useSelector(
    (state: RootState) => state.seniorFaqId.seniorFaqId
  );

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);

  // 실시간 채팅을 시작할 때 담당자에게 넘길 최근 대화 (끝난 답변만)
  useEffect(() => {
    const answerText = (item: ChatItem) => {
      const raw = item.response[0]?.answer_ko ?? '';
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((x) => x?.answer ?? '').join(' ');
      } catch {
        /* 문자열 답변 */
      }
      return raw || item.streamText || '';
    };
    // 스트리밍 중에는 50ms마다 바뀌므로 잠잠해진 뒤 한 번만 (매번 모든 답변을 JSON 파싱하지 않게)
    const id = window.setTimeout(
      () => recordExchanges(chatHistory.filter((c) => !c.loading && c.query).map((c) => ({ q: c.query, a: answerText(c) }))),
      400
    );
    return () => window.clearTimeout(id);
  }, [chatHistory]);
  const [error, setError] = useState<string | null>(null);
  const newChatItemRef = useRef<ChatItem | null>(null);

  const removeLastChatItem = useCallback(() => {
    setChatHistory((prevHistory) => prevHistory.slice(0, -1));
  }, []);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await getAllQuestions();
        dispatch(setQuestions(response.questions));
      } catch (err) {
        console.error('Error while fetching all questions:', err);
        setError(err as string);
      }
    };

    fetchAllQuestions();
  }, [dispatch]);

  // ── 자동 스크롤 (맨 아래 따라가기) ──────────────────────────
  // 내용 높이가 바뀔 때마다(새 메시지·스트리밍·늦게 뜨는 이미지) 맨 아래로 붙인다.
  // 원칙: 사용자가 손가락·휠·키보드로 스크롤하는 순간 따라가기를 바로 멈추고,
  //       스스로 맨 아래 근처까지 다시 내려오거나 '아래로' 버튼을 누를 때만 다시 따라간다.
  // (예전 문제 — 휴대폰에서 "스크롤이 너무 빠르고 튄다"는 제보의 원인)
  //  1) 위로 끌기 시작한 직후 scroll 이벤트가 "아직 바닥에서 120px 안"이라며 따라가기를 다시 켜서,
  //     스트리밍 조각이 올 때마다 손가락 아래에서 화면이 바닥으로 끌려 내려갔음
  //  2) 손가락이 화면에 닿아 있거나 관성 스크롤 중에도 매 프레임 scrollTop을 써서 관성을 끊고 위치가 튀었음
  //  3) 0.3·1·2.5초 뒤 다시 붙이기, 다음 프레임에 한 번 더 붙이기 등 여러 곳에서 따로 스크롤을 걸었음
  const contentRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true); // 맨 아래를 따라가는 중인지
  const touchingRef = useRef(false); // 손가락이 화면에 닿아 있는 동안은 절대 스크롤을 건드리지 않음
  const wasNearBottomRef = useRef(true);
  const [showDown, setShowDown] = useState(false); // '아래로' 버튼
  const [unread, setUnread] = useState(false); // 위로 올려 읽는 동안 새 내용이 왔는지

  // 맨 아래로 — 컨테이너를 직접 내린다.
  // (scrollIntoView는 쓰지 않음: 끝 표식을 컨테이너 바닥에 맞추느라 하단 여백(입력창 높이만큼)을 남겨
  //  마지막 메시지가 고정 입력창 뒤에 가려졌음)
  // 애니메이션은 하나만: 짧은 ease-out 구간으로 움직이는 바닥을 쫓고, 그사이 더 늘었으면 이어서 한 구간 더.
  // 스트리밍 조각마다 새 애니메이션을 걸지 않음 (이미 도는 중이면 그 루프가 새 바닥까지 내려감)
  const scrollAnimRef = useRef<number | null>(null);
  const stopFollowAnim = () => {
    if (scrollAnimRef.current !== null) cancelAnimationFrame(scrollAnimRef.current);
    scrollAnimRef.current = null;
  };
  const scrollToEnd = useCallback((instant = false) => {
    const container = chatContainerRef.current;
    if (!container || touchingRef.current) return;
    if (instant || prefersReducedMotion()) {
      stopFollowAnim();
      container.scrollTop = container.scrollHeight;
      return;
    }
    if (scrollAnimRef.current !== null) return;
    let from = container.scrollTop;
    let startAt = performance.now();
    // 거리에 따라 0.2~0.42초 — 멀어도 휙 날아가지 않게, 가까우면 금방
    const durationFor = (distance: number) => Math.min(420, Math.max(200, distance * 0.6));
    let duration = durationFor(container.scrollHeight - container.clientHeight - from);
    const step = (now: number) => {
      const c = chatContainerRef.current;
      if (!c || !followRef.current || touchingRef.current) {
        scrollAnimRef.current = null;
        return;
      }
      const target = c.scrollHeight - c.clientHeight;
      const p = Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      c.scrollTop = from + (target - from) * eased;
      if (p < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else if (c.scrollHeight - c.clientHeight - c.scrollTop > 1) {
        // 그사이 내용이 더 늘었음 → 지금 위치에서 새 구간
        from = c.scrollTop;
        startAt = now;
        duration = durationFor(target - from);
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        scrollAnimRef.current = null;
      }
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => () => {
    // 취소만 하고 표시를 남기면 이후 scrollToEnd가 "이미 실행 중"으로 보고 시작하지 않음 (개발 모드 StrictMode에서 재현)
    stopFollowAnim();
  }, []);

  // 따라가기 다시 켜기 (맨 아래로 돌아왔거나 '아래로' 버튼)
  const resumeFollow = useCallback(() => {
    followRef.current = true;
    setUnread(false);
    setShowDown(false);
  }, []);
  const jumpToBottom = () => {
    resumeFollow();
    scrollToEnd();
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const distance = () => container.scrollHeight - container.scrollTop - container.clientHeight;
    const pauseFollow = () => {
      followRef.current = false;
      stopFollowAnim();
    };
    let lastTop = container.scrollTop;
    const onScroll = () => {
      const top = container.scrollTop;
      const movingDown = top >= lastTop;
      lastTop = top;
      const d = distance();
      wasNearBottomRef.current = d < 120;
      // 손을 뗀 상태에서 아래로 내려와 바닥에 닿았을 때만 다시 따라감 (위로 튕기는 관성 중에는 켜지 않음)
      if (!followRef.current && !touchingRef.current && movingDown && d < RESUME_PX) resumeFollow();
      const down = !followRef.current && d > SHOW_DOWN_PX;
      setShowDown((prev) => (prev === down ? prev : down));
    };
    // 실제로 위로 올라갈 수 있을 때만 따라가기 해제 — 내용이 짧아 스크롤할 게 없는데 휠을 올리면
    // 해제된 채로 남아, 이후 칩이 늘거나 영어로 바뀌어 길어져도 내려가지 않았음
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && container.scrollTop > 0) pauseFollow();
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchingRef.current = true;
      stopFollowAnim(); // 닿는 순간 자동 스크롤을 멈춤 — 손가락과 싸우지 않게
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      // 손가락을 내림 = 위로 스크롤 → 따라가기 해제
      if (e.touches[0].clientY > touchY + 4 && container.scrollTop > 0) pauseFollow();
      touchY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;
      touchingRef.current = false;
      if (followRef.current) scrollToEnd(); // 탭만 했으면 하던 따라가기를 이어감
      else if (distance() < RESUME_PX) resumeFollow();
    };
    // 스크롤바를 마우스로 잡으면 (컨테이너 자체를 누름) 따라가기 해제
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.target === container) pauseFollow();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key) && !(e.target instanceof HTMLTextAreaElement)) pauseFollow();
    };
    // 직전까지 내용이 화면 안에 다 보였다면(스크롤 없음) 커질 때 다시 따라감
    let fitBefore = true;
    let lastHeight = content.offsetHeight;
    const observer = new ResizeObserver(() => {
      const h = content.offsetHeight;
      const grew = h > lastHeight + 2;
      lastHeight = h;
      if (fitBefore && !touchingRef.current) followRef.current = true;
      if (followRef.current) scrollToEnd();
      else if (grew) {
        setUnread(true);
        setShowDown(true);
      }
      fitBefore = container.scrollHeight <= container.clientHeight + 4;
    });
    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    observer.observe(content);
    observer.observe(container); // 스크롤 영역(위젯 창·휴대폰 키보드) 크기가 바뀌어도 바닥을 다시 맞춤
    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
    };
  }, [scrollToEnd, resumeFollow]);

  // 언어·나이트 모드를 바꾸면 글 길이·칩이 바뀌어 높이가 달라짐 → 바꾸기 직전 바닥 근처였다면 다시 바닥으로
  // (이후 높이 변화는 위 ResizeObserver가 따라감)
  useEffect(() => {
    const resettle = () => {
      if (!wasNearBottomRef.current) return;
      resumeFollow();
      scrollToEnd();
    };
    resettle();
    window.addEventListener(THEME_CHANGE_EVENT, resettle);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, resettle);
  }, [isKorean, scrollToEnd, resumeFollow]);

  // 새 대화가 추가되거나 홈·피드백을 누르면 맨 아래로 다시 붙임 (사용자가 직접 한 행동)
  useEffect(() => {
    resumeFollow();
    scrollToEnd();
  }, [chatHistory.length, homeClicked, feedbackClicked, scrollToEnd, resumeFollow]);

  // ── 천천히 보여 주기 (체크 목록 → 답변) ──────────────────────
  // 사용자 의견: "체크가 너무 짧게 지나가고 답변이 화라락 지나간다"
  // → 받은 단계·글은 여기(pacer)에 모아 두고, 화면에는 일정한 박자로 풀어 보여 줌.
  //   단계는 하나씩 간격을 두고 ✓, 글은 읽을 만한 속도로, 최종 카드는 다 보여 준 뒤에 바꿈.
  // 화면 갱신은 한 박자(32ms)에 setState 한 번 — 조각마다 다시 그리지 않게
  const pacersRef = useRef<Record<string, Pacer>>({});
  const pacerTimerRef = useRef<number | null>(null);

  const startPacer = (uid: string) => {
    const now = performance.now();
    pacersRef.current[uid] = {
      startedAt: now, steps: [], shownSteps: 0, lastStepAt: now, stepsDirty: false,
      target: '', shown: 0, textAt: 0, lastTick: now, finalPatch: null, deadline: 0,
      cList: false, cSteps: 0, cChars: 0, cWritten: false, cCollapsed: false,
    };
    ensurePacerTimer();
  };
  const appendStream = (uid: string, delta: string) => {
    const p = pacersRef.current[uid];
    if (p) p.target += delta;
  };
  // 진행 단계 추가 (같은 단계가 두 번 오면 그 자리에서 마지막 것으로)
  const addProgress = (uid: string, step: ProgressStep) => {
    const p = pacersRef.current[uid];
    if (!p) return;
    const idx = p.steps.findIndex((s) => s.key === step.key);
    if (idx < 0) p.steps.push(step);
    else {
      p.steps[idx] = step;
      if (idx < p.shownSteps) p.stepsDirty = true;
    }
  };
  // 응답 끝 — 아직 보여 줄 글이 남았으면 다 보여 준 뒤에 최종 화면으로 (그동안 입력 잠금·중지 버튼 유지)
  // 글 없이 끝난 응답(인사·카테고리·경고 안내 등)은 바로
  const finishPacer = (uid: string, patch: Partial<ChatItem>) => {
    const p = pacersRef.current[uid];
    if (p && p.target && !prefersReducedMotion()) {
      p.finalPatch = patch;
      return;
    }
    delete pacersRef.current[uid];
    const extra: Partial<ChatItem> =
      p && p.target ? { progress: p.steps, progressWritten: true, progressCollapsed: true } : {};
    setChatHistory((prev) => prev.map((item) => (item.uid === uid ? { ...item, ...extra, ...patch } : item)));
  };
  const hasPendingFinal = (uid: string) => Boolean(pacersRef.current[uid]?.finalPatch);
  const dropPacer = (uid: string) => {
    delete pacersRef.current[uid];
  };

  const pacerTick = () => {
    const now = performance.now();
    const reduce = prefersReducedMotion();
    const patches: Record<string, Partial<ChatItem>> = {};
    let unlock = false;
    for (const [uid, p] of Object.entries(pacersRef.current)) {
      const patch: Partial<ChatItem> = {};
      // 1) 단계: 첫 단계는 오자마자, 그다음은 STEP_GAP_MS 간격으로 하나씩 (글이 이미 나오는 중이면 바로)
      if (p.shownSteps < p.steps.length && (reduce || p.textAt || p.shownSteps === 0 || now - p.lastStepAt >= STEP_GAP_MS)) {
        p.shownSteps = reduce ? p.steps.length : p.shownSteps + 1;
        p.lastStepAt = now;
      }
      const listOn = reduce || p.shownSteps > 0 || now - p.startedAt >= FIRST_LIST_MS;
      // 2) 글 시작: 받은 단계를 다 보여 주고, 마지막 ✓ 뒤 '답변 정리 중…'도 한 박자 보인 다음
      if (!p.textAt && p.target && (reduce || (p.shownSteps === p.steps.length && now - p.lastStepAt >= STEP_GAP_MS))) {
        p.textAt = now;
        p.lastTick = now;
      }
      // 3) 글 풀기: 기본 BASE_CPS, 밀린 글이 많으면 빨라짐. 응답이 끝났으면 CATCHUP_MAX_MS 안에 끝나게
      if (p.textAt) {
        const dt = Math.min(250, now - p.lastTick); // 탭이 뒤로 갔다 오면 한 번에 몰아치지 않게
        p.lastTick = now;
        const backlog = p.target.length - p.shown;
        if (p.finalPatch && !p.deadline) p.deadline = now + Math.min(CATCHUP_MAX_MS, (backlog / BASE_CPS) * 1000);
        if (backlog > 0) {
          let cps = BASE_CPS + Math.max(0, backlog - 120) * 0.8;
          if (p.deadline) cps = Math.max(cps, backlog / Math.max(0.016, (p.deadline - now) / 1000));
          p.shown = reduce ? p.target.length : Math.min(p.target.length, p.shown + (cps * dt) / 1000);
        }
      }
      const chars = safeCut(p.target, p.shown);
      const written = p.textAt > 0;
      const collapsed = written && (reduce || now - p.textAt >= COLLAPSE_AFTER_MS);
      if (listOn && (!p.cList || p.cSteps !== p.shownSteps || p.stepsDirty)) {
        patch.progress = p.steps.slice(0, p.shownSteps);
        p.cList = true;
        p.cSteps = p.shownSteps;
        p.stepsDirty = false;
      }
      if (chars !== p.cChars) {
        patch.streamText = p.target.slice(0, chars);
        p.cChars = chars;
      }
      if (written !== p.cWritten) patch.progressWritten = p.cWritten = written;
      if (collapsed !== p.cCollapsed) patch.progressCollapsed = p.cCollapsed = collapsed;
      // 4) 끝까지 다 보여 줬으면 최종 카드로 바꿈
      if (p.finalPatch && written && chars >= p.target.length) {
        Object.assign(patch, { progress: p.steps, progressWritten: true, progressCollapsed: true }, p.finalPatch);
        delete pacersRef.current[uid];
        unlock = true;
      }
      if (Object.keys(patch).length) patches[uid] = patch;
    }
    if (Object.keys(patches).length) {
      setChatHistory((prev) => prev.map((item) => (patches[item.uid] ? { ...item, ...patches[item.uid] } : item)));
    }
    // 그사이 새 요청이 시작됐으면(프로필 재시도 등) 그 요청의 잠금은 건드리지 않음
    if (unlock && !activeRef.current) dispatch(setIsLoading(false));
    if (!Object.keys(pacersRef.current).length && pacerTimerRef.current !== null) {
      window.clearInterval(pacerTimerRef.current);
      pacerTimerRef.current = null;
    }
  };
  const pacerTickRef = useRef(pacerTick);
  pacerTickRef.current = pacerTick;
  const ensurePacerTimer = () => {
    if (pacerTimerRef.current === null) pacerTimerRef.current = window.setInterval(() => pacerTickRef.current(), TICK_MS);
  };
  useEffect(() => () => {
    if (pacerTimerRef.current !== null) window.clearInterval(pacerTimerRef.current);
    pacerTimerRef.current = null;
  }, []);

  // ── 답변 중지 ────────────────────────────────────────────
  // 진행 중인 요청 하나 (질문·프로필 재시도 공통). 중지하면 fetch를 끊고(→ 백엔드 → RAG까지 끊김),
  // 받은 데까지의 글은 남긴 채 바로 입력을 풀어 다시 물어볼 수 있게
  const activeRef = useRef<{ uid: string; controller: AbortController } | null>(null);
  const startRequest = (uid: string) => {
    activeRef.current?.controller.abort();
    const controller = new AbortController();
    activeRef.current = { uid, controller };
    return controller;
  };
  // 요청이 끝났을 때 — 이미 중지된 요청이면 입력 잠금을 건드리지 않음 (그사이 보낸 새 질문의 로딩을 끄지 않게)
  // 아직 보여 주는 중인 답변이 있으면 잠금은 다 보여 준 뒤(pacerTick)에 풂 — 그동안 중지 버튼이 살아 있게
  const finishRequest = (controller: AbortController, uid: string) => {
    if (activeRef.current?.controller === controller) activeRef.current = null;
    if (controller.signal.aborted) return;
    if (hasPendingFinal(uid)) return;
    dropPacer(uid); // 최종 응답 없이 끝난 경우 — 더 풀 일 없음
    dispatch(setIsLoading(false));
  };
  const lastStopSeqRef = useRef(stopSeq); // 다시 그려질 때 예전 중지 신호로 오해하지 않게
  useEffect(() => {
    if (stopSeq === lastStopSeqRef.current) return;
    lastStopSeqRef.current = stopSeq;
    const active = activeRef.current;
    activeRef.current = null;
    active?.controller.abort();
    // 화면에 보이던 자리 그대로 멈춤 — 받았지만 아직 안 보여 준 글은 버림 (멈춘 뒤 글이 더 튀어나오지 않게).
    // 응답이 이미 다 왔고 보여 주는 중이었어도 똑같이 멈춤
    const frozen: Record<string, Partial<ChatItem>> = {};
    for (const [uid, p] of Object.entries(pacersRef.current)) {
      frozen[uid] = {
        loading: false, stopped: true,
        streamText: p.target.slice(0, safeCut(p.target, p.shown)),
        progress: p.steps.slice(0, p.shownSteps),
      };
    }
    pacersRef.current = {};
    if (active && !frozen[active.uid]) frozen[active.uid] = { loading: false, stopped: true };
    if (Object.keys(frozen).length) {
      setChatHistory((prev) => prev.map((item) => (frozen[item.uid] ? { ...item, ...frozen[item.uid] } : item)));
    }
    dispatch(setIsLoading(false));
  }, [stopSeq, dispatch]);

  useEffect(() => {
    if (!sentValue || !sent) return;

    dispatch(clearSent());

    const newChatItem: ChatItem = {
      uid: nextUid(),
      query: sentValue,
      response: [],
      loading: true,
      flag: false,
      seniorMode: -1,
      is_greet: false,
      is_able: false,
      is_freq: false,
      is_smalltalk: false,
      needs_profile: false,
      missing_fields: [],
    };

    newChatItemRef.current = newChatItem;
    setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
    dispatch(setIsLoading(true));
    const uid = newChatItem.uid;
    const controller = startRequest(uid);
    const { signal } = controller;

    const fetchResponse = async () => {
      try {
        const language = isKorean ? 'KO' : 'EN';

        // FAQ 직접 클릭: ID로 바로 조회 (classify/RAG 건너뜀)
        if (directFaqId !== null) {
          const [data, recs] = await Promise.all([getFaqById(directFaqId), getRecommendationsAfterFaq(directFaqId)]);
          if (signal.aborted) return; // 그사이 중지 — 늦게 온 결과는 버림
          const faqs = data.faqs ?? [];
          setChatHistory((prevHistory) =>
            prevHistory.map((item) =>
              item.uid === uid
                ? { ...item, response: faqs, loading: false, recommendations: recs }
                : item
            )
          );
          dispatch(setIsLoading(false));
          return;
        }

        startPacer(uid);
        const serverResponse = await sendQuestionStream(
          sentValue,
          language,
          (delta) => !signal.aborted && appendStream(uid, delta),
          (meta) =>
            setChatHistory((prev) =>
              prev.map((item) => (item.uid === uid ? { ...item, streamStyle: meta.style } : item))
            ),
          { standalone, signal, onProgress: (step) => !signal.aborted && addProgress(uid, step) }
        );
        if (signal.aborted) return; // 끝나는 순간 중지를 눌렀으면 멈춘 화면 그대로
        // 경고·정지 안내 — 말풍선은 아래에서 평소처럼, 여기서는 알림창·입력 잠금
        applyModeration(serverResponse?.moderation, dispatch, isKorean, suspendedRef.current > Date.now());
        if (serverResponse && serverResponse.id >= 0) {
          dispatch(setId(serverResponse.id));
        }

        if (serverResponse) {
          // 최종 화면 — 받은 글을 아직 보여 주는 중이면 다 보여 준 뒤에 바꿈 (finishPacer)
          const recommendations = serverResponse.recommendations ?? [];
          if (serverResponse.needs_profile) {
            finishPacer(uid, { loading: false, needs_profile: true, missing_fields: serverResponse.missing_fields ?? [], recommendations });
          } else if (serverResponse.is_greet) {
            finishPacer(uid, { loading: false, is_greet: true, recommendations });
          } else if (serverResponse.is_able) {
            finishPacer(uid, { loading: false, is_able: true, recommendations });
          } else if (serverResponse.is_freq) {
            finishPacer(uid, { loading: false, is_freq: true, recommendations });
          } else if (serverResponse.is_smalltalk && Array.isArray(serverResponse.faqs)) {
            finishPacer(uid, { response: serverResponse.faqs, loading: false, is_smalltalk: true, recommendations });
          } else if (Array.isArray(serverResponse.faqs)) {
            finishPacer(uid, {
              response: serverResponse.faqs, loading: false, streamText: undefined,
              followup_fields: serverResponse.followup_fields ?? [],
              recommendations,
              audienceNote: noteOf(serverResponse),
              notFound: !!serverResponse.not_found,
            });
          } else {
            console.error('Invalid response structure:', serverResponse);
            setError('Invalid response structure');
          }
          // 입력 잠금은 finishRequest(보여 주는 중이면 다 보여 준 뒤)에서 풂
        }
      } catch (err) {
        if (signal.aborted || isAbortError(err)) return; // 중지는 오류가 아님 (화면은 중지 쪽에서 정리)
        console.error('Error while fetching response:', err);
        dropPacer(uid);
        setError(err as string);
        dispatch(setIsLoading(false));
        setChatHistory((prevHistory) =>
          prevHistory.map((item) =>
            item.uid === uid ? { ...item, loading: false } : item
          )
        );
      } finally {
        // 응답이 비어 와도(null) 입력이 잠긴 채 남지 않게
        finishRequest(controller, uid);
      }
    };

    fetchResponse();
  }, [sentValue, sent]);

  useEffect(() => {
    if (seniorFaqId !== null && seniorFaqId !== undefined) {
      const newChatItem: ChatItem = {
        uid: nextUid(),
        query: '',
        response: [],
        loading: false,
        flag: false,
        seniorMode: -1,
        is_greet: false,
        is_able: true,
        is_freq: false,
        is_smalltalk: false,
        needs_profile: false,
        missing_fields: [],
        initialSeniorFaqId: seniorFaqId,
      };
      newChatItemRef.current = newChatItem;
      setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
    }
  }, [seniorFaqId]);

  useEffect(() => {
    if (homeClicked) {
      const newChatItem: ChatItem = {
        uid: nextUid(),
        query: '',
        response: [],
        loading: false,
        flag: true,
        seniorMode: -1,
        is_greet: false,
        is_able: false,
        is_freq: false,
        is_smalltalk: false,
        needs_profile: false,
        missing_fields: [],
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
      dispatch(resetHomeClicked());
    }
  }, [homeClicked, dispatch]);

  // 프로필 저장 후 같은 질문 다시 보내기 — 막는 질문·막지 않는 질문 공통
  const retryWithProfile = (uid: string, retryQuery: string) => {
    const retryLanguage = isKorean ? 'KO' : 'EN';
    const update = (patch: Partial<ChatItem>) =>
      setChatHistory((prev) => prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item)));
    dispatch(setIsLoading(true));
    update({ loading: true, stopped: false, needs_profile: false, missing_fields: [], followup_fields: [], streamText: '',
             progress: undefined, progressWritten: false, progressCollapsed: false });
    const controller = startRequest(uid);
    const { signal } = controller;
    startPacer(uid);
    sendQuestionStream(retryQuery, retryLanguage, (delta) => !signal.aborted && appendStream(uid, delta),
      (meta) => update({ streamStyle: meta.style }), { signal, onProgress: (step) => !signal.aborted && addProgress(uid, step) })
      .then((serverResponse) => {
        if (!serverResponse || signal.aborted) return;
        applyModeration(serverResponse.moderation, dispatch, isKorean, suspendedRef.current > Date.now());
        if (serverResponse.id >= 0) dispatch(setId(serverResponse.id));
        if (serverResponse.needs_profile) {
          finishPacer(uid, { loading: false, needs_profile: true, missing_fields: serverResponse.missing_fields ?? [] });
        } else if (serverResponse.is_greet) {
          finishPacer(uid, { loading: false, is_greet: true });
        } else if (serverResponse.is_able) {
          finishPacer(uid, { loading: false, is_able: true });
        } else if (serverResponse.is_freq) {
          finishPacer(uid, { loading: false, is_freq: true });
        } else if (serverResponse.is_smalltalk && Array.isArray(serverResponse.faqs)) {
          finishPacer(uid, { response: serverResponse.faqs, loading: false, is_smalltalk: true });
        } else if (Array.isArray(serverResponse.faqs)) {
          finishPacer(uid, { response: serverResponse.faqs, loading: false, streamText: undefined,
                   followup_fields: serverResponse.followup_fields ?? [],
                   recommendations: serverResponse.recommendations ?? [], audienceNote: noteOf(serverResponse),
                   notFound: !!serverResponse.not_found });
        } else {
          finishPacer(uid, { loading: false });
        }
      })
      .catch((err) => {
        if (signal.aborted || isAbortError(err)) return;
        console.error('재시도 중 오류:', err);
        dropPacer(uid);
        update({ loading: false });
      })
      .finally(() => finishRequest(controller, uid));
  };

  // 대화 항목에 넘기는 함수는 항상 같은 참조로 — 스트리밍 중 지난 대화 항목이 다시 그려지지 않게 (ChatEntry는 memo)
  const retryRef = useRef(retryWithProfile);
  retryRef.current = retryWithProfile;
  const onRetry = useCallback((uid: string, query: string) => retryRef.current(uid, query), []);

  return (
    <>
    <div
      ref={chatContainerRef}
      // 아래쪽 여백(입력창 높이만큼)은 스크롤 영역이 아니라 안쪽 내용 상자에 —
      // Safari는 스크롤 영역(특히 flex 상자)의 padding-bottom을 스크롤 범위에 넣지 않아 마지막 내용이 입력창 뒤에 가린 채
      // 직접 내려도 내려가지 않았음 (Chrome은 넣어서 재현 안 됨)
      className="chat-scroll absolute inset-0 overflow-y-auto px-4 pt-6 md:px-[20px] md:pt-[30px]"
    >
      <div ref={contentRef} className="pb-[calc(80px+var(--input-extra,0px))] md:pb-[calc(100px+var(--input-extra,0px))]">
      <HelloHobit />
      {chatHistory.map((chatItem) => (
        <ChatEntry
          key={chatItem.uid}
          item={chatItem}
          isKorean={isKorean}
          onRetry={onRetry}
          onBack={removeLastChatItem}
        />
      ))}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    </div>
    {/* 위로 올려 읽는 중에만 — 누르면 맨 아래로, 새 내용이 왔으면 점 표시 */}
    <button
      type="button"
      onClick={jumpToBottom}
      aria-label={isKorean ? (unread ? '새 답변 보기 (아래로)' : '아래로') : unread ? 'New messages below' : 'Scroll to bottom'}
      tabIndex={showDown ? 0 : -1}
      aria-hidden={!showDown}
      className={`absolute left-1/2 z-40 flex h-[40px] w-[40px] -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-md transition-[opacity,transform] duration-200 ease-out hover:text-ink bottom-[calc(92px+var(--input-extra,0px))] md:bottom-[calc(116px+var(--input-extra,0px))] ${
        showDown ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-[8px]'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
      {unread && <span className="absolute right-[1px] top-[1px] h-[10px] w-[10px] rounded-full border-2 border-surface bg-accent-ink" aria-hidden="true" />}
    </button>
    </>
  );
};

// ── 대화 항목 하나 ─────────────────────────────────────────
// memo: 스트리밍으로 마지막 항목만 바뀔 때 지난 항목(카드·마크다운·칩)은 다시 그리지 않음.
// 바뀐 항목만 새 객체가 되므로(map에서 나머지는 그대로) item 참조 비교로 충분
type ChatEntryProps = {
  item: ChatItem;
  isKorean: boolean;
  onRetry: (uid: string, query: string) => void;
  onBack: () => void;
};
const ChatEntry = memo(function ChatEntry({ item: chatItem, isKorean, onRetry, onBack }: ChatEntryProps) {
  return (
        <div>
          {chatItem.seniorMode >= 0 ? (
            <div className="mt-6 md:mt-[40px] empty:hidden">
              <SeniorResponse
                seniorFaqId={chatItem.seniorMode}
                onBack={onBack}
              />
            </div>
          ) : chatItem.flag ? (
            <div className="mt-6 md:mt-[40px]">
              <HelloHobit />
            </div>
          ) : (
            <>
              <div className={!chatItem.query ? 'invisible' : ''}>
                <Query text={chatItem.query} />
              </div>
              {/* 답변 영역: 폭 = 위 카드 줄의 실제 폭 → 안내 문구·추천 칩이 그 폭에 맞춰짐 (카드 1장이든 3장이든).
                  좁은 화면에서는 호빗 쪽 카드 오른쪽에 여유(24px)를 둠 — 채팅 앱처럼 내 말풍선과 구분 */}
              {/* 카테고리 화면은 화면 폭을 다 써서 칸이 늘어나도록 (내용 폭으로 감싸면 칸이 글자 길이에 맞춰 줄어듦) */}
              <div className={chatItem.is_able ? 'w-full' : 'w-fit max-w-full pr-[24px] md:pr-0'}>
              {chatItem.needs_profile ? (
                <ProfileInput
                  missingFields={chatItem.missing_fields}
                  onSaved={() => onRetry(chatItem.uid, chatItem.query)}
                />
              ) : chatItem.is_able ? (
                <AllCategoriesResponse initialSeniorFaqId={chatItem.initialSeniorFaqId} />
              ) : chatItem.is_greet ? (
                <GreetResponse />
              ) : chatItem.is_freq ? (
                <FAQResponse />
              ) : (
                <>
                  <GeneralResponse
                    faqs={chatItem.response}
                    loading={chatItem.loading}
                    streamText={chatItem.streamText}
                    streamStyle={chatItem.streamStyle}
                    stopped={chatItem.stopped}
                    progress={chatItem.progress}
                    progressWritten={chatItem.progressWritten}
                    progressCollapsed={chatItem.progressCollapsed}
                    notFound={chatItem.notFound}
                  />
                  {!chatItem.loading && chatItem.audienceNote && (
                    <p className="hobit-appear mt-[8px] inline-flex items-center gap-[6px] rounded-full bg-card px-[12px] py-[4px] text-f-caption text-ink-2 break-keep">
                      {isKorean
                        ? `질문에 맞춰 ${chatItem.audienceNote === 'graduate' ? '대학원' : '학부'} 기준으로 답했어요`
                        : `Answered for ${chatItem.audienceNote === 'graduate' ? 'graduate' : 'undergraduate'} students, based on your question`}
                    </p>
                  )}
                  {!chatItem.loading && (chatItem.followup_fields?.length ?? 0) > 0 && (
                    <ProfileInput
                      variant="followup"
                      missingFields={chatItem.followup_fields ?? []}
                      onSaved={() => onRetry(chatItem.uid, chatItem.query)}
                    />
                  )}
                </>
              )}
              {/* AI(LLM)가 쓴 답변 아래에는 항상 확인 안내 (행정실 FAQ 원문·인사 등에는 붙이지 않음) */}
              {!chatItem.loading && chatItem.response?.[0]?.maincategory_ko === 'AI 답변' && (
                <p className={`hobit-appear mt-[10px] md:mt-[12px] w-0 min-w-full text-f-caption leading-snug text-ink-3 break-keep`}>
                  {isKorean
                    ? 'AI 답변은 정확하지 않을 수 있어요. 정확한 내용은 정보대학 홈페이지나 행정실에 꼭 확인해 주세요.'
                    : 'AI answers may be inaccurate. Please confirm with the college website or the administrative office.'}
                </p>
              )}
              {/* 추천 질문은 어떤 응답 뒤에도 — 사용자 질문 기준 (시작 화면 "이런 질문은 어때요?"는 처음에만) */}
              {chatItem.query && !chatItem.loading && (
                <RecChips
                  widthClass="w-0 min-w-full"
                  // 고른 근거(reason: next·answer·related)와 상관없이 같은 제목 — 학생에게는 차이가 와닿지 않아 헷갈렸음
                  title={isKorean ? '이어서 물어볼 만한 질문' : 'You might also ask'}
                  items={chatItem.recommendations ?? EMPTY_RECS}
                />
              )}
              </div>
            </>
          )}
        </div>
  );
});
const EMPTY_RECS: RecItem[] = [];

export default Chatting;
