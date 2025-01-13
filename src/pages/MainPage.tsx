import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../redux/store';
import Header from '../components/Header';
import Input from '../components/Input';
import AutoComplete from '../components/AutoComplete';
import Chatting from '../components/Chatting';
import Modal from '../components/Modal';
import { closeMenu } from '../redux/menuSlice';

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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      {/* 오버레이 추가 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={handleOutsideClick}
        ></div>
      )}

      {/* 모달 */}
      <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
        <Modal />
      </div>

      {/* 채팅 영역 */}
      <div>
        <Chatting />
      </div>

      {/* 자동완성 */}
      {isEmpty ? <></> : <AutoComplete />}

      {/* 입력 */}
      <Input />
    </div>
  );
};

export default MainPage;
