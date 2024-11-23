import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Faq } from '../../types/faq';
import { RootState } from '../../redux/store';

interface ResponseProps {
  faqs: Faq[];
  text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  return (
    <div className="bg-gray-100 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block">
      {text &&
        text
          .split('\n')
          .map((line, index) =>
            line === '' ? <br key={index} /> : <p key={index}>{line}</p>
          )}

      {faqs.length > 0 && (
        <div>
          {(isKorean ? faqs[0].answer_ko : faqs[0].answer_en)
            .replace(/\n/g, '\n\n')
            .split('\n')
            .map((line, index) =>
              line === '' ? <br key={index} /> : <p key={index}>{line}</p>
            )}
        </div>
      )}
    </div>
  );
};

export default Response;
