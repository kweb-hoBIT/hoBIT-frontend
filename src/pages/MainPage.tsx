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
    <div className="flex flex-col h-screen overflow-hidden pt-[60px] md:pt-[70px]">
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

      <div className="flex-1 overflow-hidden">
        <Chatting />
      </div>

      {isEmpty ? <></> : <AutoComplete />}

      <Input />
    </div>
  );
};

export default MainPage;
