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
    <div className="h-[70px] bg-white fixed top-0 w-full border-b-2 border-[#bbbbbb] flex items-center relative px-[20px] py-[20px]">
      <div>
        <LuMenu
          className="text-[28px] text-gray-400 hover:text-black mr-[20px]"
          onClick={() => dispatch(toggleMenu())}
        />
      </div>

      <p className="absolute left-1/2 transform -translate-x-1/2 font-7bold text-[26px]">
        {i18n.headerTitle}
      </p>

	  <div className="ml-auto relative w-[88px] h-[32px] bg-[#D9D9D9] rounded-[20px] flex items-center">
        <div
          className={`absolute h-full rounded-full justify-center transition-transform duration-500 ease-in-out bg-black ${
            isKorean ? 'translate-x-0 w-[50px]' : 'translate-x-[48px] w-[40px]'
          }`}
        ></div>

        <button
          onClick={() => dispatch(setKorean())}
          className={`w-[50px] h-full z-10 text-[16px] font-6semibold rounded-full transition-colors duration-500 ${
            isKorean ? 'text-white' : 'text-[#aaaaaa]'
          }`}
        >
          KOR
        </button>

        <button
          onClick={() => dispatch(setEnglish())}
          className={`w-[38px] h-full z-10 text-[16px] font-6semibold rounded-full transition-colors duration-500 ${
            !isKorean ? 'text-white' : 'text-[#aaaaaa]'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};
//<IoClose
//  className="text-gray-400 absolute right-4 text-[28px] hover:text-black"
///>

export default Header;
