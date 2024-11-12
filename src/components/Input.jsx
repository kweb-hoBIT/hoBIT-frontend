import { FaRobot } from 'react-icons/fa6';
import { TbSend2 } from 'react-icons/tb';

import { useDispatch, useSelector } from 'react-redux';
import { setInputValue, clearInputValue } from '../redux/inputSlice';

const Input = () => {
  const dispatch = useDispatch();
  const inputValue = useSelector((state) => state.input.value);

  const handleChange = (event) => {
    dispatch(setInputValue(event.target.value));
  };

  return (
    <div className="bg-white fixed bottom-0 w-full h-[80px] flex items-center px-[20px]">
      <FaRobot className="text-[32px] text-[#750E21] mr-[20px]" />
      <div className="bg-[#DDDDDD] w-full h-[48px] px-4 rounded-[30px] flex flex-row items-center">
        <input
          type="text"
          placeholder="호빗에게 물어보세요!"
          onChange={handleChange}
          className="bg-transparent w-full outline-none placeholder-[#aaaaaa] font-6semibold text-[20px]"
        />
        <TbSend2 className="text-[24px] text-[#aaaaaa] hover:text-[#000000] cursor-pointer" />
      </div>
    </div>
  );
};

export default Input;
