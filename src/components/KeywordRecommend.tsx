import { useDispatch } from 'react-redux';

import { sendInputValue, clearSentValue } from '../redux/inputSlice';

const KeywordRecommend: React.FC = () => {
  const dispatch = useDispatch();

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
      className="w-full h-[70px] bg-[#EEEEEE] rounded-t-[30px] fixed bottom-[80px] px-[20px] flex justify-center items-center"
      style={{
        boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button className="font-6semibold text-[22px] text-[#686D76] mr-[10px]">
        추천 키워드🔍
      </button>
      <button
        onClick={handleReset}
        className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]"
      >
        처음으로
      </button>
      <button
        onClick={() => handleSendKeyword('행정')}
        className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]"
      >
        행정
      </button>
      <button
        onClick={() => handleSendKeyword('생활')}
        className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]"
      >
        생활
      </button>
      <button
        onClick={() => handleSendKeyword('자주 묻는 질문')}
        className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] hover:bg-[#e8b9c2]"
      >
        자주 묻는 질문
      </button>
    </div>
  );
};

export default KeywordRecommend;
