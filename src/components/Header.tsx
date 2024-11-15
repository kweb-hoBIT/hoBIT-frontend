import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const Header: React.FC = () => {
  const [isKorean, setIsKorean] = useState<boolean>(true);

  return (
    <div className="h-[70px] bg-white fixed top-0 w-full border-b-2 border-[#bbbbbb] flex items-center relative px-[20px] py-[20px]">
      <div className="relative w-[88px] h-[36px] bg-[#D9D9D9] rounded-[20px] flex items-center">
        <div
          className={`absolute h-full rounded-full justify-center transition-transform duration-500 ease-in-out bg-black ${
            isKorean ? 'translate-x-0 w-[50px]' : 'translate-x-[48px] w-[40px]'
          }`}
        ></div>

        <button
          onClick={() => setIsKorean(true)}
          className={`w-[50px] h-full z-10 text-[16px] font-6semibold rounded-full transition-colors duration-500 ${
            isKorean ? 'text-white' : 'text-[#aaaaaa]'
          }`}
        >
          KOR
        </button>

        <button
          onClick={() => setIsKorean(false)}
          className={`w-[38px] h-full z-10 text-[16px] font-6semibold rounded-full transition-colors duration-500 ${
            !isKorean ? 'text-white' : 'text-[#aaaaaa]'
          }`}
        >
          EN
        </button>
      </div>

      <p className="absolute left-1/2 transform -translate-x-1/2 font-7bold text-[26px]">
        정보대학 챗봇 호빗
      </p>
      <IoClose className="text-[#aaaaaa] absolute right-4 text-[28px] hover:text-[#000000]" />
    </div>
  );
};

export default Header;
