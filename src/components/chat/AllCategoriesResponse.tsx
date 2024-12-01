import { IoChevronBackOutline } from 'react-icons/io5';

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

  const [showAllCategories, setShowAllCategories] = useState(true);

  const [visibleCategories, setVisibleCategories] = useState<boolean[]>(
    Array(8).fill(false)
  );

  const showAll = () => {
    setShowAllCategories(true);
    setVisibleCategories(Array(8).fill(false));
  };

  const toggleCategory = (index: number) => {
    setVisibleCategories((prev) => prev.map((_, i) => i === index));
    if (showAllCategories) {
      setShowAllCategories(false);
    }
    console.log(visibleCategories);
  };

  return (
    <div>
      <HobitProfile />
      {showAllCategories && (
        <Response
          text={
            isKorean
              ? `할 수 있는 일 카테고리예요!\n카테고리를 클릭해서 세부 카테고리를 확인해보세요`
              : `Here's what I can do!\nFeel free to ask more if you have any other questions.`
          }
          faqs={faqs}
        />
      )}
      {!showAllCategories && (
        <div
          onClick={showAll}
          className="bg-gray-100 pl-[15px] pr-[20px] cursor-pointer rounded-[20px] w-fit flex flex-row items-center py-[10px] mt-[10px] text-[20px] font-6semibold text-[#686D76] hover:bg-gray-200"
        >
          <IoChevronBackOutline className="text-[18px] mr-[10px]" />
          {isKorean ? '전체 카테고리 보기' : 'See All Categories'}
        </div>
      )}
      {showAllCategories && (
        <>
          <div className="flex flex-row mt-[10px]">
            {[
              { index: 0, emoji: '👨‍🏫', label_ko: '수업', label_en: 'Class' },
              {
                index: 1,
                emoji: '📄',
                label_ko: '학적',
                label_en: 'Academic Status',
              },
              {
                index: 2,
                emoji: '📚',
                label_ko: '복수전공',
                label_en: 'Double Major',
              },
              {
                index: 3,
                emoji: '📖',
                label_ko: '융합전공',
                label_en: 'Integrated Major',
              },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-gray-100 w-[100px] h-[100px] flex flex-col items-center justify-center rounded-[20px] mr-[10px] hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleCategory(category.index)}
              >
                <span className="text-[30px]">{category.emoji}</span>
                <span
                  className={`font-6semibold text-center mx-auto ${
                    isKorean ? 'text-[18px]' : 'text-[16px]'
                  }`}
                >
                  {isKorean ? category.label_ko : category.label_en}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-row mt-[10px]">
            {[
              {
                index: 4,
                emoji: '💰',
                label_ko: '장학',
                label_en: 'Scholarship',
              },
              {
                index: 5,
                emoji: '🎓',
                label_ko: '졸업',
                label_en: 'Graduation',
              },
              {
                index: 6,
                emoji: '🏙️',
                label_ko: '현장실습',
                label_en: 'Internship',
              },
              { index: 7, emoji: '', label_ko: 'ETC.', label_en: 'ETC.' },
            ].map((category, index) => (
              <div
                key={index}
                className="bg-gray-100 w-[100px] h-[100px] flex flex-col items-center justify-center rounded-[20px] mr-[10px] hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleCategory(category.index)}
              >
                <span className="text-[30px]">{category.emoji}</span>
                <span
                  className={`font-6semibold ${
                    isKorean ? 'text-[18px]' : 'text-[16px]'
                  }`}
                >
                  {isKorean ? category.label_ko : category.label_en}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {visibleCategories[0] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              수업👨‍🏫
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('출석인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                출석인정
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('불응시 성적인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                불응시 성적인정
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('수강신청')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                수강신청
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[1] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              학적📄
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('계좌번호 변경')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                계좌번호 변경
              </button>
              <button
                onClick={() => handleSendKeyword('융합전공/전과')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                융합전공/전과
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('휴학')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                휴학
              </button>
              <button
                onClick={() => handleSendKeyword('기재사항 정정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                기재사항 정정
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('학점인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학점인정
              </button>
              <button
                onClick={() => handleSendKeyword('등록금 환불')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                등록금 환불
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[2] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              복수전공📚
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('졸업')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[3] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              융합전공📖
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('중복인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                중복인정
              </button>
              <button
                onClick={() => handleSendKeyword('포기신청')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                포기신청
              </button>
              <button
                onClick={() => handleSendKeyword('지원방법')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                지원방법
              </button>
              <button
                onClick={() => handleSendKeyword('교육과정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                교육과정
              </button>
              <button
                onClick={() => handleSendKeyword('휴학')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                휴학
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('소벤융')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                소벤융
              </button>
              <button
                onClick={() => handleSendKeyword('이수요건')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                이수요건
              </button>
              <button
                onClick={() => handleSendKeyword('신청')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                신청
              </button>
              <button
                onClick={() => handleSendKeyword('이수구분 변경')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                이수구분 변경
              </button>
              <button
                onClick={() => handleSendKeyword('학점인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학점인정
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('융합전공 지원')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                융합전공 지원
              </button>
              <button
                onClick={() => handleSendKeyword('중복인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                중복인정
              </button>
              <button
                onClick={() => handleSendKeyword('졸업사정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업사정
              </button>
              <button
                onClick={() => handleSendKeyword('졸업요건')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업요건
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[4] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              장학💰
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('추천서/직인 날인')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                추천서/직인 날인
              </button>
              <button
                onClick={() => handleSendKeyword('외국인 장학')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                외국인 장학
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('국가장학금')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                국가장학금
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('성적우수장학금')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                성적우수장학금
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[5] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              졸업🎓
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('학위기')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학위기
              </button>
              <button
                onClick={() => handleSendKeyword('졸업식')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업식
              </button>
              <button
                onClick={() => handleSendKeyword('학위복')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학위복
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('졸업사정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업사정
              </button>
              <button
                onClick={() => handleSendKeyword('졸업요건 제출')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                졸업요건 제출
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('대체과목')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                대체과목
              </button>
              <button
                onClick={() => handleSendKeyword('재수강')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                재수강
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[6] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              현장실습🏙️
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('신청')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                신청
              </button>
              <button
                onClick={() => handleSendKeyword('수강신청')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                수강신청
              </button>
              <button
                onClick={() => handleSendKeyword('학점인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학점인정
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('성적')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                성적
              </button>
              <button
                onClick={() => handleSendKeyword('실습 중단')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                실습 중단
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('실습 기간')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                실습 기간
              </button>
              <button
                onClick={() => handleSendKeyword('전공인정')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                전공인정
              </button>
            </div>
          </div>
        </div>
      )}

      {visibleCategories[7] && (
        <div className="bg-gray-100 rounded-[20px] px-[20px] pt-[15px] pb-[10px] mt-[10px] w-[500px]">
          <div>
            <button className="font-6semibold text-[20px] inline-block">
              ETC.
            </button>
          </div>
          <div className="w-full h-[1px] bg-gray-400 mt-[5px]" />
          <div className="mt-[5px] w-full flex flew-row">
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('실험실/안전교육')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                실험실/안전교육
              </button>
              <button
                onClick={() => handleSendKeyword('학생증 발급')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학생증 발급
              </button>
              <button
                onClick={() => handleSendKeyword('외국인 상담')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                외국인 상담
              </button>
            </div>
            <div className="w-full text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('교환학생')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                교환학생
              </button>
              <button
                onClick={() => handleSendKeyword('포스터 게시')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                포스터 게시
              </button>
            </div>
            <div className="w-full mr-[-60px] text-left flex flex-col">
              <button
                onClick={() => handleSendKeyword('학위기')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                학위기
              </button>
              <button
                onClick={() => handleSendKeyword('취창업계')}
                className="font-6semibold text-left text-[#686D76] text-[20px] inline-block py-[5px] rounded-[20px] mr-[5px] hover:text-black"
              >
                취창업계
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCategoriesResponse;
