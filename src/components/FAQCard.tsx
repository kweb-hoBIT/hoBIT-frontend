import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { lang } from '../i18n/lang';

const FAQCard: React.FC = () => {
  const { cardPayload } = useSelector((state: RootState) => state.faqCard);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const i18n = isKorean ? lang.ko : lang.en;

  if (!cardPayload) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto mt-20 p-10 bg-gray-50 rounded-2xl shadow-2xl">
      <h2 className="text-4xl font-extrabold mb-8">{i18n.answerLabel}</h2>
      <div className="mb-8">
        <p className="text-2xl font-bold mb-4">{i18n.answerLabel}</p>
        <p className="text-gray-800 text-xl leading-relaxed whitespace-pre-line">
          {isKorean ? cardPayload.answer_ko : cardPayload.answer_en}
        </p>
      </div>
      {cardPayload.manager && (
        <div>
          <p className="text-2xl font-bold mb-4">{i18n.managerContact}</p>
          <p className="text-gray-800 text-xl leading-relaxed">
            {cardPayload.manager}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQCard;
