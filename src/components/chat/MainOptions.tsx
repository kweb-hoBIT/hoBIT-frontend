import { CiImageOn } from 'react-icons/ci';

import { useDispatch } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';

const MainOptions: React.FC = () => {
  const dispatch = useDispatch();

  const handleSendOption = (message: string) => {
    dispatch(sendInputValue(message));

    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div className="bg-[#eeeeee] w-[265px] h-auto mt-[20px] rounded-[20px] flex flex-col items-center p-[20px]">
      <CiImageOn className="text-[#686D76] text-[50px] my-[40px]" />
      <button
        onClick={() => handleSendOption('자주 묻는 질문')}
        className="w-full bg-[#F3D0D7] text-[#686D76] font-6semibold text-[20px] py-[5px] rounded-[20px] mb-[10px] hover:bg-[#e8b9c2]"
      >
        자주 묻는 질문
      </button>
      <button
        onClick={() => handleSendOption('할 수 있는 일')}
        className="w-full bg-[#F3D0D7] text-[#686D76] font-6semibold text-[20px] py-[5px] rounded-[20px] hover:bg-[#e8b9c2]"
      >
        할 수 있는 일
      </button>
    </div>
  );
};

export default MainOptions;
