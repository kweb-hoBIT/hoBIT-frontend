import React, { useEffect, useState } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { TbSend2 } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';

import {
  sendInputValue,
  setIsEmpty,
  updateLiveValue,
} from '../redux/inputSlice';
import { setHomeClicked } from '../redux/homeSlice';
import { RootState } from '../redux/store';

const Input: React.FC = () => {
  const dispatch = useDispatch();
  const liveValue = useSelector((state: RootState) => state.input.liveValue);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [liveValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    dispatch(updateLiveValue(value));
    dispatch(setIsEmpty(value === ''));
  };

  const handleSend = () => {
    if (liveValue.trim() !== '') {
      dispatch(sendInputValue(liveValue));
      dispatch(updateLiveValue(''));
      dispatch(setIsEmpty(true));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleHomeClick = () => {
    dispatch(setHomeClicked());
  };

  return (
    <div className="bg-white border-t-2 fixed bottom-0 w-full h-[80px] flex items-center px-[20px]">
      <AiFillHome
        className="text-[32px] text-[#750E21] mr-[20px] hover:text-gray-600 cursor-pointer"
        onClick={handleHomeClick}
      />
      <div className="bg-gray-200 w-full h-[48px] px-4 rounded-[30px] flex flex-row items-center">
        <input
          type="text"
          ref={inputRef}
          placeholder={
            isKorean ? '호빗에게 물어보세요!' : 'Ask Anything to HoBIT!'
          }
          value={liveValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-transparent w-full outline-none placeholder-[#aaaaaa] font-6semibold text-[20px]"
        />
        <TbSend2
          onClick={handleSend}
          className="ml-[10px] text-[24px] text-[#aaaaaa] hover:text-[#000000] cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Input;
