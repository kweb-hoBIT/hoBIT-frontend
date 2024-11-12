import { LuLightbulb } from 'react-icons/lu';
import { LuLightbulbOff } from 'react-icons/lu';

import { useState } from 'react';

const AutoComplete = () => {
  const [isAutocompleteOn, setIsAutocompleteOn] = useState(true);

  const toggleAutocomplete = () => {
    setIsAutocompleteOn(!isAutocompleteOn);
  };

  return (
    <>
      {isAutocompleteOn ? (
        <div
          className="w-full h-[70px] bg-[#EEEEEE] rounded-t-[30px] fixed bottom-[80px] px-[20px] flex justify-between items-center"
          style={{
            boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="text-[28px]">💡</span>
          <div
            onClick={toggleAutocomplete}
            className="flex items-center px-[15px] bg-black rounded-[20px] py-[5px] hover:bg-[#aaa]"
          >
            <LuLightbulb className="text-white text-[18px] mr-[10px]" />
            <p className="text-white font-6semibold text-[18px]">
              자동완성 끄기
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-[70px] fixed bottom-[80px] px-[20px] flex items-end justify-end">
          <div
            onClick={toggleAutocomplete}
            className="flex items-center px-[15px] bg-black rounded-[20px] py-[5px] hover:bg-[#aaa]"
          >
            <LuLightbulbOff className="text-white text-[18px] mr-[10px]" />
            <p className="text-white font-6semibold text-[18px]">
              자동완성 켜기
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AutoComplete;
