// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
// import { RootState } from '../../redux/store';

// import HobitProfile from './HobitProfile';
// import Response from './Response';
// import { Faq } from '../../types/faq';

// const AllCategoriesResponse: React.FC = () => {
//   const dispatch = useDispatch();
//   const [faqs, setFaqs] = useState<Faq[]>([]);
//   const isKorean = useSelector((state: RootState) => state.language.isKorean);

//   const handleSendKeyword = (message: string) => {
//     dispatch(sendInputValue(message));

//     setTimeout(() => {
//       dispatch(clearSentValue());
//     }, 100);
//   };

//   return (
//     <div>
//       <HobitProfile />
//       <Response
//         text={
//           isKorean
//             ? `할 수 있는 일 카테고리예요!\n궁금한 점이 있으면 추가로 질문해주세요!`
//             : `Here's what I can do!\nFeel free to ask more if you have any other questions.`
//         }
//         faqs={faqs}
//       />
//       {isKorean ? (
//         <>
//           <div className="mt-[10px]">
//             <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
//               행정💼
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('수업')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               수업
//             </button>
//             <button
//               onClick={() => handleSendKeyword('융합전공')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               융합전공
//             </button>
//             <button
//               onClick={() => handleSendKeyword('이중전공')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               이중전공
//             </button>
//             <button
//               onClick={() => handleSendKeyword('ETC')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               ETC
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('졸업')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               졸업
//             </button>
//             <button
//               onClick={() => handleSendKeyword('학적')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               학적
//             </button>
//             <button
//               onClick={() => handleSendKeyword('현장실습')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               현장실습
//             </button>
//             <button
//               onClick={() => handleSendKeyword('복수전공')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               복수전공
//             </button>
//           </div>

//           <div className="mt-[10px]">
//             <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
//               생활🪴
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('수강신청')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               수강신청
//             </button>
//             <button
//               onClick={() => handleSendKeyword('건물')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               건물
//             </button>
//             <button
//               onClick={() => handleSendKeyword('동아리')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               동아리
//             </button>
//             <button
//               onClick={() => handleSendKeyword('학교축제')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               학교축제
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('스터디')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               스터디
//             </button>
//             <button
//               onClick={() => handleSendKeyword('교환학생')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               교환학생
//             </button>
//           </div>
//         </>
//       ) : (
//         <>
//           <div className="mt-[10px]">
//             <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
//               Administration 💼
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('Class')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Class
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Interdisciplinary Major')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Interdisciplinary Major
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Double Major')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Double Major
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('ETC')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               ETC
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Graduation')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Graduation
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Academic Status')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Academic Status
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Internship')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Internship
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('Minor')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Minor
//             </button>
//           </div>
//           <div className="mt-[10px]">
//             <button className="bg-[#F3D0D7] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px]">
//               Campus Life 🪴
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('Course Registration')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Course Registration
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Buildings')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Buildings
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Clubs')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Clubs
//             </button>
//           </div>
//           <div className="mt-[5px]">
//             <button
//               onClick={() => handleSendKeyword('School Festival')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               School Festival
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Study Groups')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Study Groups
//             </button>
//             <button
//               onClick={() => handleSendKeyword('Exchange Student')}
//               className="bg-[#DDDDDD] font-6semibold text-[#686D76] text-[20px] inline-block px-[20px] py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
//             >
//               Exchange Student
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AllCategoriesResponse;

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';

const AllCategoriesResponse: React.FC = () => {
  const dispatch = useDispatch();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const handleSendKeyword = (message: string) => {
    dispatch(sendInputValue(message));

    setTimeout(() => {
      dispatch(clearSentValue());
    }, 100);
  };

  return (
    <div>
      <HobitProfile />
      <Response
        text={
          isKorean
            ? `할 수 있는 일 카테고리예요!\n궁금한 점이 있으면 추가로 질문해주세요!`
            : `Here's what I can do!\nFeel free to ask more if you have any other questions.`
        }
        faqs={faqs}
      />
      <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[350px]">
        <div>
          <button className="font-6semibold text-[20px] inline-block">
            행정💼
          </button>
        </div>
        <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
        <div className="mt-[5px] w-full flex flew-row">
          <div className="w-full text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('수업')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              수업
            </button>
            <button
              onClick={() => handleSendKeyword('융합전공')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              융합전공
            </button>
            <button
              onClick={() => handleSendKeyword('이중전공')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              이중전공
            </button>
          </div>
          <div className="w-full text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('ETC')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              ETC
            </button>
            <button
              onClick={() => handleSendKeyword('졸업')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              졸업
            </button>
            <button
              onClick={() => handleSendKeyword('학적')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              학적
            </button>
          </div>
          <div className="w-full mr-[-60px] text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('현장실습')}
              className="font-6semibold w-[100px] text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              현장실습
            </button>
            <button
              onClick={() => handleSendKeyword('복수전공')}
              className="font-6semibold w-[100px] text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              복수전공
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[350px]">
        <div>
          <button className="font-6semibold text-[20px] inline-block">
            생활🪴
          </button>
        </div>
        <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
        <div className="mt-[5px] w-full flex flew-row">
          <div className="w-full text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('수강신청')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              수강신청
            </button>
            <button
              onClick={() => handleSendKeyword('건물')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              건물
            </button>
          </div>
          <div className="w-full text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('학교축제')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              학교축제
            </button>
            <button
              onClick={() => handleSendKeyword('스터디')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              스터디
            </button>
          </div>
          <div className="w-full mr-[-60px] text-left flex flex-col">
            <button
              onClick={() => handleSendKeyword('동아리')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              동아리
            </button>
            <button
              onClick={() => handleSendKeyword('교환학생')}
              className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:bg-[#ccc]"
            >
              교환학생
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesResponse;
