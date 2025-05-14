import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import ChatContainer from './ChatContainer';
import Button from '../common/Button';
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
      <div className="flex w-full justify-around items-center">
        <Button
          buttonType="text"
          onClick={() => handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQ')}
        >
          {isKorean ? '자주 묻는 질문' : 'FAQ'}
        </Button>
        <span className="text-[28px] text-gray-400 font-1thin">|</span>
        <Button
          buttonType="text"
          onClick={() =>
            handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
          }
        >
          {isKorean ? '할 수 있는 일' : 'What I Can Do'}
        </Button>
      </div>
    </ChatContainer>
  );
};

export default MainOptions;
