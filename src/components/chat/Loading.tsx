import React from 'react';
import './Loading.css'; // 작성한 CSS 파일을 import

const Loading: React.FC = () => {
  return (
    <div className="bg-gray-100 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block">
      <div className="dots">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default Loading;
