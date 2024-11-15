import { TbThumbUpFilled } from 'react-icons/tb';
import { TbThumbDownFilled } from 'react-icons/tb';

import { useState } from 'react';

const Survey: React.FC = () => {
  const [thumbUp, setThumbUp] = useState(false);
  const [thumbDown, setThumbDown] = useState(false);

  const handleThumbUpClick = () => {
    setThumbUp(!thumbUp);
    if (thumbDown) setThumbDown(false);
  };

  const handleThumbDownClick = () => {
    setThumbDown(!thumbDown);
    if (thumbUp) setThumbUp(false);
  };

  return (
    <div className="flex flex-row w-[365px] items-center bg-[#eeeeee] font-5medium text-[#686D76] text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[10px] ">
      <p>호빗의 응답이 도움이 되었어요!</p>
      <div className="bg-white p-[10px] rounded-full ml-[20px]">
        <TbThumbUpFilled
          onClick={handleThumbUpClick}
          className={thumbUp ? 'text-[#F075AA]' : 'text-[#ddd]'}
        />
      </div>
      <div className="bg-white p-[10px] rounded-full ml-[10px]">
        <TbThumbDownFilled
          onClick={handleThumbDownClick}
          className={thumbDown ? 'text-[#F075AA]' : 'text-[#ddd]'}
        />
      </div>
    </div>
  );
};

export default Survey;
