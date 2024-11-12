import React from 'react';

const KeywordRecommend: React.FC = () => {
  return (
    <div
      className="w-full h-[70px] bg-[#EEEEEE] rounded-t-[30px] fixed bottom-[80px] px-[20px] flex justify-center items-center"
      style={{
        boxShadow: '0 -6px 15px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button className="font-6semibold text-[22px] text-[#686D76] mr-[10px]">
        추천 키워드🔍
      </button>
      <button className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]">
        처음으로
      </button>
      <button className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]">
        행정
      </button>
      <button className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] mr-[10px] hover:bg-[#e8b9c2]">
        생활
      </button>
      <button className="font-6semibold text-[22px] text-[#686D76] bg-[#F3D0D7] rounded-[20px] px-[15px] py-[5px] hover:bg-[#e8b9c2]">
        자주 묻는 질문
      </button>
    </div>
  );
};

export default KeywordRecommend;
