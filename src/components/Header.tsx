import { LuMenu } from 'react-icons/lu';
import { IoClose } from 'react-icons/io5';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { lang } from '../i18n/lang';
import { setEnglish, setKorean } from '../redux/languageSlice';
import { toggleMenu } from '../redux/menuSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const i18n = isKorean ? lang.ko : lang.en;

  return (
    <div className="h-[60px] md:h-[70px] bg-white fixed top-0 left-0 w-full border-b-2 border-[#bbbbbb] flex justify-between items-center z-50 px-[15px] md:px-[20px] py-[20px]">
      <div className="w-[60px] md:w-[84px] flex justify-start">
        <LuMenu
          className="text-[24px] md:text-[28px] text-gray-400 hover:text-black cursour-pointer"
          onClick={() => dispatch(toggleMenu())}
        />
      </div>

      <p className="flex-1 text-center font-7bold text-[18px] md:text-[26px] whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="md:hidden">
          {isKorean ? '정보대학(학부) 호빗' : i18n.headerTitle}
        </span>
        <span className="hidden md:inline">{i18n.headerTitle}</span>
      </p>

      <div className="w-[60px] md:w-[84px] flex justify-end">
        <div className="relative w-[60px] md:w-[84px] h-[28px] md:h-[32px] bg-[#D9D9D9] rounded-[20px] flex items-center">
          <div
            className={`absolute h-full rounded-full transition-transform duration-500 ease-in-out bg-black w-[30px] md:w-[42px] ${
              isKorean ? 'translate-x-0' : 'translate-x-[30px] md:translate-x-[42px]'
            }`}
          ></div>

          <button
            onClick={() => dispatch(setKorean())}
            className={`w-[30px] md:w-[42px] h-full z-10 text-[14px] md:text-[16px] font-6semibold rounded-full transition-colors duration-500 flex justify-center items-center ${
              isKorean ? 'text-white' : 'text-[#aaaaaa]'
            }`}
          >
            <span className="md:hidden">한</span>
            <span className="hidden md:block">KOR</span>
          </button>

          <button
            onClick={() => dispatch(setEnglish())}
            className={`w-[30px] md:w-[42px] h-full z-10 text-[14px] md:text-[16px] font-6semibold rounded-full transition-colors duration-500 flex justify-center items-center ${
              !isKorean ? 'text-white' : 'text-[#aaaaaa]'
            }`}
          >
            <span className="md:hidden">A</span>
            <span className="hidden md:block">EN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
