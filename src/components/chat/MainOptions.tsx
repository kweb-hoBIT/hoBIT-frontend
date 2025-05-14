import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import ChatContainer from './ChatContainer';
const MainOptions: React.FC = () => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const homeImg = useSelector(
    (state: RootState) => state.image.images['homeImage']
  );

  const handleSendOption = (message: string) => {
    dispatch(sendInputValue(message));
    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <ChatContainer className="gap-[10px]">
      <img
        src={homeImg}
        alt="home image"
        className="w-[125px] sm:w-[150px] md:w-[175px] lg:w-[200px]"
        loading="eager"
      />
      <div className="flex w-full justify-between items-center">
        <button
          onClick={() => handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQ')}
          className="w-full text-[#686D76] font-6semibold text-[20px] py-[5px] hover:text-black"
        >
          {isKorean ? '자주 묻는 질문' : 'FAQ'}
        </button>
        <span className="text-[28px] text-gray-400 font-1thin">|</span>
        <button
          onClick={() =>
            handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
          }
          className="w-full text-[#686D76] font-6semibold text-[20px] py-[5px] hover:text-black"
        >
          {isKorean ? '할 수 있는 일' : 'What I Can Do'}
        </button>
      </div>
    </ChatContainer>
  );
};

export default MainOptions;
