import { TbThumbUpFilled } from 'react-icons/tb';
import { TbThumbDownFilled } from 'react-icons/tb';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { rateFAQ } from '../../api/query';
import { RootState } from '../../redux/store';

type SurveyProps = {
  id: number;
};

const Survey: React.FC<SurveyProps> = ({ id }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [thumbUp, setThumbUp] = useState(false);
  const [thumbDown, setThumbDown] = useState(false);

  const handleThumbUpClick = async () => {
    try {
      setThumbUp(!thumbUp);
      if (thumbDown) setThumbDown(false);
      if (!thumbUp) {
        const response = await rateFAQ({ faq_id: id, rating: 1 });
        console.log(response);
      }
    } catch (error) {
      console.error('Error rating FAQ (Thumb Up):', error);
    }
  };

  const handleThumbDownClick = async () => {
    try {
      setThumbDown(!thumbDown);
      if (thumbUp) setThumbUp(false);
      if (!thumbDown) {
        const response = await rateFAQ({ faq_id: id, rating: -1 });
        console.log(response);
      }
    } catch (error) {
      console.error('Error rating FAQ (Thumb Down):', error);
    }
  };

  return (
    <div className="flex flex-row w-[365px] items-center bg-gray-100 font-5medium text-[#686D76] text-[18px] mt-[10px] rounded-[20px] px-[20px] py-[10px] ">
      <p>
        {isKorean ? '호빗의 응답이 도움이 되었어요!' : 'Was HoBIT helpful?'}
      </p>
      <div className="bg-white p-[10px] rounded-full ml-[40px] cursor-pointer">
        <TbThumbUpFilled
          onClick={handleThumbUpClick}
          className={thumbUp ? 'text-[#F075AA]' : 'text-[#ddd]'}
        />
      </div>
      <div className="bg-white p-[10px] rounded-full ml-[15px] cursor-pointer">
        <TbThumbDownFilled
          onClick={handleThumbDownClick}
          className={thumbDown ? 'text-[#F075AA]' : 'text-[#ddd]'}
        />
      </div>
    </div>
  );
};

export default Survey;
