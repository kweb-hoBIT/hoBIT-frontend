import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';

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
    <div className="bg-gray-100 w-fit min-w-[300px] h-auto mt-[20px] rounded-[20px] flex flex-col items-center p-[20px]">
      <img
        src={homeImg}
        alt="home image"
        className="w-[150px] md:w-[200px] mb-[10px]"
        loading="eager"
      />
      <div className="flex w-full justify-between items-center">
        <button
          onClick={() => handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQs')}
          className="w-full text-[#686D76] font-6semibold text-lg md:text-xl py-[5px] hover:text-black"
        >
          {isKorean ? '자주 묻는 질문' : 'FAQs'}
        </button>
        <span className="text-xl md:text-2xl text-gray-400 font-1thin">|</span>
        <button
          onClick={() =>
            handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
          }
          className="w-full text-[#686D76] font-6semibold text-lg md:text-xl py-[5px] hover:text-black"
        >
          {isKorean ? '할 수 있는 일' : 'What I Can Do'}
        </button>
      </div>
    </div>
  );
};

export default MainOptions;
