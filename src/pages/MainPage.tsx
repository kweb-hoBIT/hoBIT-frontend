import { lazy, Suspense, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../redux/store';
import Header from '../components/Header';
import Input from '../components/Input';
import AutoComplete from '../components/AutoComplete';
import Chatting from '../components/Chatting';
import Modal, { preloadMenuContent } from '../components/Modal';
import { closeMenu } from '../redux/menuSlice';
import { onIdle, once } from '../lib/idle';
import { preloadMarkdown } from '../components/chat/Response';
import { getAllFAQs, getAllSeniorFAQs } from '../api/query';
import { DelayedSpinner } from '../components/ui/Skeleton';
import { getToken } from '../api/liveChat';

// 실시간 채팅 창(+ socket.io)은 처음 열 때만 받음 — 첫 화면 번들에서 제외. 메뉴를 열면 미리 받기 시작
export const preloadLiveChat = once(() => import('../components/livechat/LiveChat'));
const LiveChat = lazy(preloadLiveChat);

const MainPage: React.FC = () => {
  const isEmpty = useSelector((state: RootState) => state.input.isEmpty);
  const isModalOpen = useSelector((state: RootState) => state.menu.isOpen);
  const liveChatOpen = useSelector((state: RootState) => state.liveChat.open);
  const dispatch = useDispatch();
  // 한 번 연 채팅 창은 닫아도 그대로 두어 입력해 둔 정보·너비가 유지됨 (예전처럼 항상 붙어 있던 것과 같은 동작)
  const [liveChatMounted, setLiveChatMounted] = useState(false);
  useEffect(() => {
    if (liveChatOpen) setLiveChatMounted(true);
  }, [liveChatOpen]);
  // 채팅 인증 토큰이 있으면(진행 중인 채팅이 있을 수 있음) 한가할 때 창을 붙여 둠 — 창은 닫힌 채로 확인만 하고,
  // 진행 중이면 오른쪽 가장자리에 돌아가기 탭이 보임 (새로고침해도 돌아갈 채팅이 있다는 걸 알 수 있게)
  useEffect(
    () =>
      onIdle(() => {
        if (getToken()) setLiveChatMounted(true);
      }),
    []
  );

  // 첫 화면이 그려진 뒤 한가할 때: 답변 마크다운 렌더러·메뉴 내용 코드와 메뉴의 FAQ 목록을 미리 받아 둠
  useEffect(
    () =>
      onIdle(() => {
        preloadMarkdown().catch(() => undefined);
        preloadMenuContent().catch(() => undefined);
        getAllFAQs().catch(() => undefined);
        getAllSeniorFAQs().catch(() => undefined);
      }),
    []
  );
  // 메뉴를 열면 실시간 채팅 코드도 미리 (메뉴에 채팅 버튼이 있음)
  useEffect(() => {
    if (isModalOpen) preloadLiveChat().catch(() => undefined);
  }, [isModalOpen]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (isModalOpen) {
      dispatch(closeMenu());
    }
  };

  return (
    // 모바일 브라우저는 100vh가 주소창·툴바 뒤까지 포함해 마지막 메시지가 가려짐 → 보이는 높이(100dvh) 우선.
    // dvh를 지원하지 않는 브라우저는 인라인 값을 무시하고 h-screen(100vh)을 씀.
    <div className="flex flex-col h-screen overflow-hidden pt-[60px] md:pt-[70px]" style={{ height: '100dvh' }}>
      <Header />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={handleOutsideClick}
        ></div>
      )}

      <div className="relative z-[60]" onClick={(e) => e.stopPropagation()}>
        <Modal />
      </div>

      {/* 대화 영역 높이는 절대 위치로 확정 (flex 안의 h-full은 Safari에서 내용만큼 늘어나 아래가 잘릴 수 있음) */}
      <div className="flex-1 min-h-0 relative">
        <Chatting />
      </div>

      {isEmpty ? <></> : <AutoComplete />}

      <Input />

      {/* 실시간 채팅 창 (메뉴에서 열기) — 코드를 받는 동안은 같은 자리에 빈 창과 회전 표시 */}
      {liveChatMounted && (
        <Suspense fallback={liveChatOpen ? <LiveChatFallback /> : null}>
          <LiveChat />
        </Suspense>
      )}
    </div>
  );
};

// 채팅 창 코드를 받는 동안 — 실제 창과 같은 자리·배경 (0.15초 뒤에야 회전 표시)
const LiveChatFallback: React.FC = () => (
  <>
    <div className="fixed inset-0 z-[79] bg-black/20 hobit-appear" aria-hidden="true" />
    <div className="fixed inset-y-0 right-0 z-[80] flex w-full flex-col items-center justify-center bg-page shadow-2xl md:w-[440px] md:border-l md:border-line hobit-appear">
      <DelayedSpinner />
    </div>
  </>
);

export default MainPage;
