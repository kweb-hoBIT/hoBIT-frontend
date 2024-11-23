import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../redux/inputSlice';
import { RootState } from '../redux/store';

const KeywordRecommend: React.FC = () => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const handleReset = () => {
    window.location.reload();
  };

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));

    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div
      className="w-full h-[70px] bg-gray-200 rounded-t-[30px] fixed bottom-[80px] px-[20px] flex justify-center items-center"
      style={{
        boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button className="font-5medium text-[22px] mr-[10px]">
        {isKorean ? '추천 키워드' : 'keyword'}
      </button>
      <button
        onClick={handleReset}
        className="font-6semibold text-[22px] text-[#686D76] border-2 border-gray-300 rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-gray-300"
      >
        {isKorean ? '처음으로' : 'reset'}
      </button>
      <button
        onClick={() => handleSendKeyword('행정')}
        className="font-6semibold text-[22px] text-[#686D76] border-2 border-gray-300 rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-gray-300"
      >
        {isKorean ? '행정' : 'administration'}
      </button>
      <button
        onClick={() => handleSendKeyword('생활')}
        className="font-6semibold text-[22px] text-[#686D76] border-2 border-gray-300 rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-gray-300"
      >
        {isKorean ? '생활' : 'lifestyle'}
      </button>
      <button
        onClick={() => handleSendKeyword('자주 묻는 질문')}
        className="font-6semibold text-[22px] text-[#686D76] border-2 border-gray-300 rounded-[20px] px-[15px] py-[5px] hover:bg-gray-300"
      >
        {isKorean ? '자주 묻는 질문' : 'FAQ'}
      </button>
    </div>
  );
};

export default KeywordRecommend;
