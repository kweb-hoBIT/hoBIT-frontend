import { useDispatch } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';

import HobitProfile from './HobitProfile';
import Response from './Response';

const FAQResponse: React.FC = () => {
  const dispatch = useDispatch();

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));

    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div className="">
      <HobitProfile />
      <Response
        text={`자주 묻는 질문 카테고리예요!\n궁금한 점이 있으면 추가로 질문해주세요!`}
      />
      <div className="mt-[10px]">
        <button
          onClick={() => handleSendKeyword('공간예약🏫')}
          className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#e8b9c2]"
        >
          공간예약🏫
        </button>
        <button
          onClick={() => handleSendKeyword('안전교육⛑️')}
          className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#e8b9c2]"
        >
          안전교육⛑️
        </button>
        <button
          onClick={() => handleSendKeyword('학위기🎓')}
          className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] hover:bg-[#e8b9c2]"
        >
          학위기🎓
        </button>
      </div>
      <div className="mt-[10px]">
        <button
          onClick={() => handleSendKeyword('졸업요건 확인✔️')}
          className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#e8b9c2]"
        >
          졸업요건 확인✔️
        </button>
        <button
          onClick={() => handleSendKeyword('교환학생🌎')}
          className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] hover:bg-[#e8b9c2]"
        >
          교환학생🌎
        </button>
      </div>
    </div>
  );
};

export default FAQResponse;
