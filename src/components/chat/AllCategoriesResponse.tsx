import { useDispatch } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';

import HobitProfile from './HobitProfile';
import Response from './Response';

const AllCategoriesResponse: React.FC = () => {
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
        text={`할 수 있는 일 카테고리예요!\n궁금한 점이 있으면 추가로 질문해주세요!`}
      />
      <div className="mt-[10px]">
        <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
          행정💼
        </button>
      </div>
      <div className="mt-[5px]">
        <button
          onClick={() => handleSendKeyword('수업')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          수업
        </button>
        <button
          onClick={() => handleSendKeyword('융합전공')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          융합전공
        </button>
        <button
          onClick={() => handleSendKeyword('이중전공')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          이중전공
        </button>
        <button
          onClick={() => handleSendKeyword('ETC')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          ETC
        </button>
      </div>
      <div className="mt-[5px]">
        <button
          onClick={() => handleSendKeyword('졸업')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          졸업
        </button>
        <button
          onClick={() => handleSendKeyword('학적')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          학적
        </button>
        <button
          onClick={() => handleSendKeyword('현장실습')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          현장실습
        </button>
        <button
          onClick={() => handleSendKeyword('복수전공')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          복수전공
        </button>
      </div>

      <div className="mt-[10px]">
        <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
          생활🪴
        </button>
      </div>
      <div className="mt-[5px]">
        <button
          onClick={() => handleSendKeyword('수강신청')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          수강신청
        </button>
        <button
          onClick={() => handleSendKeyword('건물')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          건물
        </button>
        <button
          onClick={() => handleSendKeyword('동아리')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          동아리
        </button>
        <button
          onClick={() => handleSendKeyword('학교축제')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          학교축제
        </button>
      </div>
      <div className="mt-[5px]">
        <button
          onClick={() => handleSendKeyword('스터디')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          스터디
        </button>
        <button
          onClick={() => handleSendKeyword('교환학생')}
          className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
        >
          교환학생
        </button>
      </div>
    </div>
  );
};

export default AllCategoriesResponse;
