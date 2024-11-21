import React, { useEffect, useState } from 'react';
import { FaRobot } from 'react-icons/fa6';
import { TbSend2 } from 'react-icons/tb';
import { useDispatch } from 'react-redux';

import { sendInputValue, setIsEmpty } from '../redux/inputSlice';

const Input: React.FC = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [inputValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    dispatch(setIsEmpty(value === ''));
  };

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      dispatch(sendInputValue(inputValue));
      setInputValue('');
      dispatch(setIsEmpty(true));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="bg-white fixed bottom-0 w-full h-[80px] flex items-center px-[20px]">
      <FaRobot className="text-[32px] text-[#750E21] mr-[20px]" />
      <div className="bg-[#DDDDDD] w-full h-[48px] px-4 rounded-[30px] flex flex-row items-center">
        <input
          type="text"
          ref={inputRef}
          placeholder="호빗에게 물어보세요!"
          value={inputValue}
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
