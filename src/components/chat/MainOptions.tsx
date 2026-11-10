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
    <div className="bg-card w-full max-w-[520px] md:max-w-none md:w-[350px] h-auto mt-[12px] md:mt-[20px] rounded-[16px] md:rounded-[20px] flex flex-col items-center px-[14px] pt-[10px] pb-[6px] md:p-[20px]">
      <img
        src={homeImg}
        alt="home image"
        width={400}
        height={400}
        className="w-[124px] md:w-[200px] h-auto aspect-square mb-[2px] md:mb-[10px]"
        loading="eager"
      />
      <div className="flex w-full justify-between items-center">
        <button
          onClick={() => handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQs')}
          className="w-full text-ink-2 font-6semibold text-f-base py-[4px] md:py-[5px] hover:text-ink"
        >
          {isKorean ? '자주 묻는 질문' : 'FAQs'}
        </button>
        <span className="text-f-lg text-ink-3 font-1thin">|</span>
        <button
          onClick={() =>
            handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
          }
          className="w-full text-ink-2 font-6semibold text-f-base py-[4px] md:py-[5px] hover:text-ink"
        >
          {isKorean ? '할 수 있는 일' : 'What I Can Do'}
        </button>
      </div>
    </div>
  );
};

export default MainOptions;
