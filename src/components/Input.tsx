import { FaRobot } from 'react-icons/fa6';
import { TbSend2 } from 'react-icons/tb';

import { useDispatch, useSelector } from 'react-redux';
import { setInputValue } from '../redux/inputSlice';
import { RootState } from '../redux/store';
import { useHobitMutateApi } from '../hooks/hobit';
import { QuestionRequest } from '../types/question';
import { openCard } from '../redux/faqCardSlice';

const Input: React.FC = () => {
  const dispatch = useDispatch();
  const inputValue = useSelector((state: RootState) => state.input.value);
  const requestQuestion = useHobitMutateApi('question');

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue.trim() !== '') {
      questionHandler(inputValue);
    }
  };

  const questionHandler = async (question: string) => {
    const req: QuestionRequest = {
      question: question,
    };

    const { payload, error } = await requestQuestion({
      type: 'question',
      ...req,
    });

    if (error) {
      console.error('Error, ', error);
      return;
    }

    if (payload) {
      dispatch(openCard(payload.faq));
    }

    dispatch(setInputValue(''));
  };

  return (
    <div className="bg-white fixed bottom-0 w-full h-[80px] flex items-center px-[20px]">
      <FaRobot className="text-[32px] text-[#750E21] mr-[20px]" />
      <div className="bg-[#DDDDDD] w-full h-[48px] px-4 rounded-[30px] flex flex-row items-center">
        <input
          type="text"
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
