import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../redux/store';
import Header from '../components/Header';
import Input from '../components/Input';
import AutoComplete from '../components/AutoComplete';
import Chatting from '../components/Chatting';
import Modal from '../components/Modal';
import { closeMenu } from '../redux/menuSlice';
import LiveChat from '../components/livechat/LiveChat';

const MainPage: React.FC = () => {
  const isEmpty = useSelector((state: RootState) => state.input.isEmpty);
  const isModalOpen = useSelector((state: RootState) => state.menu.isOpen);
  const dispatch = useDispatch();

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

      {/* 실시간 채팅 창 (메뉴에서 열기) */}
      <LiveChat />
    </div>
  );
};

export default MainPage;
