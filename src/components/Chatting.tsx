import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HelloHobit from './chat/HelloHobit';
import GeneralResponse from './chat/GeneralResponse';
import FAQResponse from './chat/FAQResponse';
import AllCategoriesResponse from './chat/AllCategoriesResponse';
import SeniorResponse from './chat/SeniorResponse';
import Query from './chat/Query';
import { RootState } from '../redux/store';
import { Faq } from '../types/faq';
import { sendQuestionStream, getAllQuestions, getFaqById, getRecommendationsAfterFaq } from '../api/query';
import { setQuestions } from '../redux/questionsSlice';
import { resetHomeClicked } from '../redux/homeSlice';
import { clearSent } from '../redux/inputSlice';
import GreetResponse from './chat/GreetResponse';
import ProfileInput from './chat/ProfileInput';
import { setId, setIsLoading } from '../redux/inputSlice';
import { THEME_CHANGE_EVENT } from './Header';
import RecChips, { RecItem } from './chat/RecChips';
import { recordExchanges } from '../lib/recentChat';


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
  recommendations?: RecItem[];   // 답변 아래 "이어서 많이 묻는 질문"
  initialSeniorFaqId?: number;
}

let chatItemSeq = 0;
const nextUid = () => `chat-${Date.now()}-${chatItemSeq++}`;

const Chatting: React.FC = () => {
  const dispatch = useDispatch();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const sent = useSelector((state: RootState) => state.input.sent);
  const directFaqId = useSelector((state: RootState) => state.input.directFaqId);
  const standalone = useSelector((state: RootState) => state.input.standalone);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
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
    recordExchanges(chatHistory.filter((c) => !c.loading && c.query).map((c) => ({ q: c.query, a: answerText(c) })));
  }, [chatHistory]);
  const [error, setError] = useState<string | null>(null);
  const newChatItemRef = useRef<ChatItem | null>(null);

  const removeLastChatItem = () => {
    setChatHistory((prevHistory) => prevHistory.slice(0, -1));
  };

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

  // ── 자동 스크롤 ───────────────────────────────────────────
  // 내용 높이가 바뀔 때마다(새 메시지·스트리밍·늦게 뜨는 이미지) 맨 아래로 붙인다.
  // 사용자가 위로 올려 읽는 중이면 따라가지 않고, 새 질문을 보내면 다시 맨 아래로 붙는다.
  // (예전처럼 상태가 바뀔 때마다 0.5초 뒤 smooth 스크롤을 예약하면, 스트리밍 조각마다 애니메이션이 겹쳐 버벅임)
  const contentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  // 맨 아래로 — 컨테이너를 직접 내린다.
  // (scrollIntoView는 쓰지 않음: 끝 표식을 컨테이너 바닥에 맞추느라 하단 여백(입력창 높이만큼)을 남겨
  //  마지막 메시지가 고정 입력창 뒤에 가려졌음 — 브라우저 측정으로 확인)
  // 한 번에 점프하지 않고 매 프레임 남은 거리의 일정 비율(12%)만큼 내려감 — 멀면 빠르게, 가까우면 천천히
  // (거리와 관계없이 약 0.5초 안에 부드럽게 도착). 스트리밍 중에도 같은 루프 하나가 늘어나는 바닥을 계속 쫓음 —
  // 조각마다 smooth 스크롤을 새로 예약하던 예전 방식처럼 애니메이션이 겹치지 않음
  const scrollAnimRef = useRef<number | null>(null);
  const scrollToEnd = () => {
    if (scrollAnimRef.current !== null) return; // 이미 따라가는 중이면 그 루프가 새 바닥까지 내려감
    const step = () => {
      const container = chatContainerRef.current;
      const remaining = container ? container.scrollHeight - container.clientHeight - container.scrollTop : 0;
      if (!container || remaining <= 1 || !stickToBottomRef.current) {
        scrollAnimRef.current = null;
        return;
      }
      container.scrollTop += Math.ceil(Math.max(remaining * 0.12, 2));
      scrollAnimRef.current = requestAnimationFrame(step);
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  };
  useEffect(() => () => {
    // 취소만 하고 표시를 남기면 이후 scrollToEnd가 "이미 실행 중"으로 보고 시작하지 않음 (개발 모드 StrictMode에서 재현)
    if (scrollAnimRef.current !== null) cancelAnimationFrame(scrollAnimRef.current);
    scrollAnimRef.current = null;
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    // 따라가기를 멈추는 건 사용자가 직접 위로 올릴 때만 (휠·터치·키보드).
    // scroll 이벤트만 보고 판단하면, 우리가 내린 스크롤의 이벤트가 내용이 더 늘어난 뒤에 처리될 때
    // "맨 아래가 아님"으로 오판해 스트리밍 중 자동 스크롤이 멈췄음
    const nearBottom = () => container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    const onScroll = () => {
      wasNearBottomRef.current = nearBottom();
      if (wasNearBottomRef.current) stickToBottomRef.current = true; // 다시 맨 아래로 내려오면 따라가기 재개
    };
    // 실제로 위로 올라갈 수 있을 때만 따라가기 해제 — 내용이 짧아 스크롤할 게 없는데 휠을 올리면
    // 해제된 채로 남아, 이후 칩이 늘거나 영어로 바뀌어 길어져도 내려가지 않았음
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && container.scrollTop > 0) stickToBottomRef.current = false;
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0].clientY > touchY + 5 && container.scrollTop > 0) stickToBottomRef.current = false; // 손가락을 내림 = 위로 스크롤
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key) && !(e.target instanceof HTMLTextAreaElement)) {
        stickToBottomRef.current = false;
      }
    };
    // 직전까지 내용이 화면 안에 다 보였다면(스크롤 없음) 커질 때 다시 따라감
    let fitBefore = true;
    const observer = new ResizeObserver(() => {
      if (fitBefore) stickToBottomRef.current = true;
      if (stickToBottomRef.current) scrollToEnd();
      fitBefore = container.scrollHeight <= container.clientHeight + 4;
    });
    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    observer.observe(content);
    observer.observe(container); // 스크롤 영역(위젯 창 등) 크기가 바뀌어도 바닥을 다시 맞춤
    // 처음 몇 초는 웹폰트·이미지가 늦게 적용되며 높이가 바뀜 → 사용자가 위로 올리지 않았다면 바닥을 다시 확인
    // (Safari·위젯에서 첫 화면이 바닥에 안 붙던 문제 대비)
    const settleTimers = [300, 1000, 2500].map((ms) => window.setTimeout(() => stickToBottomRef.current && scrollToEnd(), ms));
    return () => {
      settleTimers.forEach((t) => window.clearTimeout(t));
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
    };
  }, []);

  // 언어·나이트 모드를 바꾸면 글 길이·칩이 바뀌어 높이가 달라짐 → 바꾸기 직전 바닥 근처였다면 다시 바닥으로.
  // 칩이 다시 나타나는 동안(약 1초) 높이가 또 바뀌므로 잠시 뒤 한 번 더 (Safari에서 바닥이 안 맞던 문제 대비)
  const wasNearBottomRef = useRef(true);
  useEffect(() => {
    const resettle = () => {
      if (!wasNearBottomRef.current) return;
      stickToBottomRef.current = true;
      scrollToEnd();
      window.setTimeout(() => stickToBottomRef.current && scrollToEnd(), 1100);
    };
    resettle();
    window.addEventListener(THEME_CHANGE_EVENT, resettle);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, resettle);
  }, [isKorean]);

  // 새 대화가 추가되거나 홈·피드백을 누르면 맨 아래로 다시 붙임
  useEffect(() => {
    stickToBottomRef.current = true;
    scrollToEnd();
    // 이미지·카드가 늦게 그려지는 경우를 위해 다음 프레임에 한 번 더
    requestAnimationFrame(() => stickToBottomRef.current && scrollToEnd());
  }, [chatHistory.length, homeClicked, feedbackClicked]);

  // ── 스트리밍 조각 묶기 ────────────────────────────────────
  // 조각마다 setState하면 답변 하나에 수백 번 다시 그림 → 약 50ms마다 모아서 한 번에 반영
  const streamBufferRef = useRef<Record<string, string>>({});
  const streamTimerRef = useRef<number | null>(null);
  const appendStream = (uid: string, delta: string) => {
    streamBufferRef.current[uid] = (streamBufferRef.current[uid] ?? '') + delta;
    if (streamTimerRef.current !== null) return;
    streamTimerRef.current = window.setTimeout(() => {
      const pending = streamBufferRef.current;
      streamBufferRef.current = {};
      streamTimerRef.current = null;
      setChatHistory((prev) =>
        prev.map((item) =>
          pending[item.uid] ? { ...item, streamText: (item.streamText ?? '') + pending[item.uid] } : item
        )
      );
    }, 50);
  };

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

    const fetchResponse = async () => {
      try {
        const language = isKorean ? 'KO' : 'EN';

        // FAQ 직접 클릭: ID로 바로 조회 (classify/RAG 건너뜀)
        if (directFaqId !== null) {
          const [data, recs] = await Promise.all([getFaqById(directFaqId), getRecommendationsAfterFaq(directFaqId)]);
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

        const serverResponse = await sendQuestionStream(
          sentValue,
          language,
          (delta) => appendStream(uid, delta),
          (meta) =>
            setChatHistory((prev) =>
              prev.map((item) => (item.uid === uid ? { ...item, streamStyle: meta.style } : item))
            ),
          { standalone }
        );
        if (serverResponse && serverResponse.id >= 0) {
          dispatch(setId(serverResponse.id));
        }

        if (serverResponse) {
          if (serverResponse.needs_profile) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, loading: false, needs_profile: true, missing_fields: serverResponse.missing_fields ?? [],
                      recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else if (serverResponse.is_greet) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, loading: false, is_greet: true, recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else if (serverResponse.is_able) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, loading: false, is_able: true, recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else if (serverResponse.is_freq) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, loading: false, is_freq: true, recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else if (serverResponse.is_smalltalk && Array.isArray(serverResponse.faqs)) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, response: serverResponse.faqs, loading: false, is_smalltalk: true,
                      recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else if (Array.isArray(serverResponse.faqs)) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.uid === uid
                  ? { ...item, response: serverResponse.faqs, loading: false, streamText: undefined,
                      followup_fields: serverResponse.followup_fields ?? [],
                      recommendations: serverResponse.recommendations ?? [] }
                  : item
              )
            );
          } else {
            console.error('Invalid response structure:', serverResponse);
            setError('Invalid response structure');
          }
          dispatch(setIsLoading(false));
        }
      } catch (err) {
        console.error('Error while fetching response:', err);
        setError(err as string);
        dispatch(setIsLoading(false));
        setChatHistory((prevHistory) =>
          prevHistory.map((item) =>
            item.uid === uid ? { ...item, loading: false } : item
          )
        );
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
    update({ loading: true, needs_profile: false, missing_fields: [], followup_fields: [], streamText: '' });
    sendQuestionStream(retryQuery, retryLanguage, (delta) => appendStream(uid, delta), (meta) => update({ streamStyle: meta.style }))
      .then((serverResponse) => {
        if (!serverResponse) return;
        if (serverResponse.id >= 0) dispatch(setId(serverResponse.id));
        if (serverResponse.needs_profile) {
          update({ loading: false, needs_profile: true, missing_fields: serverResponse.missing_fields ?? [] });
        } else if (serverResponse.is_greet) {
          update({ loading: false, is_greet: true });
        } else if (serverResponse.is_able) {
          update({ loading: false, is_able: true });
        } else if (serverResponse.is_freq) {
          update({ loading: false, is_freq: true });
        } else if (serverResponse.is_smalltalk && Array.isArray(serverResponse.faqs)) {
          update({ response: serverResponse.faqs, loading: false, is_smalltalk: true });
        } else if (Array.isArray(serverResponse.faqs)) {
          update({ response: serverResponse.faqs, loading: false, streamText: undefined,
                   followup_fields: serverResponse.followup_fields ?? [],
                   recommendations: serverResponse.recommendations ?? [] });
        } else {
          update({ loading: false });
        }
      })
      .catch((err) => {
        console.error('재시도 중 오류:', err);
        update({ loading: false });
      });
  };

  return (
    <div
      ref={chatContainerRef}
      // 아래쪽 여백(입력창 높이만큼)은 스크롤 영역이 아니라 안쪽 내용 상자에 —
      // Safari는 스크롤 영역(특히 flex 상자)의 padding-bottom을 스크롤 범위에 넣지 않아 마지막 내용이 입력창 뒤에 가린 채
      // 직접 내려도 내려가지 않았음 (Chrome은 넣어서 재현 안 됨)
      className="chat-scroll absolute inset-0 overflow-y-auto px-4 pt-6 md:px-[20px] md:pt-[30px]"
    >
      <div ref={contentRef} className="pb-[calc(80px+var(--input-extra,0px))] md:pb-[calc(100px+var(--input-extra,0px))]">
      <HelloHobit />
      {chatHistory.map((chatItem, index) => (
        <div key={chatItem.uid}>
          {chatItem.seniorMode >= 0 ? (
            <div className="mt-6 md:mt-[40px] empty:hidden">
              <SeniorResponse 
                seniorFaqId={chatItem.seniorMode} 
                onBack={removeLastChatItem}
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
                  좁은 화면에서는 호빗 쪽 카드 오른쪽에 여유(28px)를 둠 — 채팅 앱처럼 내 말풍선과 구분 */}
              {/* 카테고리 화면은 화면 폭을 다 써서 칸이 늘어나도록 (내용 폭으로 감싸면 칸이 글자 길이에 맞춰 줄어듦) */}
              <div className={chatItem.is_able ? 'w-full' : 'w-fit max-w-full pr-[28px] md:pr-0'}>
              {chatItem.needs_profile ? (
                <ProfileInput
                  missingFields={chatItem.missing_fields}
                  onSaved={() => retryWithProfile(chatItem.uid, chatItem.query)}
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
                  />
                  {!chatItem.loading && (chatItem.followup_fields?.length ?? 0) > 0 && (
                    <ProfileInput
                      variant="followup"
                      missingFields={chatItem.followup_fields ?? []}
                      onSaved={() => retryWithProfile(chatItem.uid, chatItem.query)}
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
              {/* 추천 질문은 어떤 응답 뒤에도 — 사용자 질문 기준 (요즘 많이 묻는 질문은 시작 화면에만) */}
              {chatItem.query && !chatItem.loading && (
                <RecChips
                  widthClass="w-0 min-w-full"
                  title={
                    chatItem.recommendations?.some((r) => r.reason === 'next')
                      ? isKorean ? '이어서 많이 묻는 질문' : 'People also ask'
                      : chatItem.recommendations?.some((r) => r.reason === 'answer')
                        ? isKorean ? '이어서 물어볼 만한 질문' : 'You might also ask'
                        : isKorean ? '관련 질문' : 'Related questions'
                  }
                  items={chatItem.recommendations ?? []}
                />
              )}
              </div>
            </>
          )}
        </div>
      ))}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      </div>
    </div>
  );
};

export default Chatting;
