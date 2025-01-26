import { TbThumbUpFilled } from 'react-icons/tb';
import { TbThumbDownFilled } from 'react-icons/tb';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { rateFAQ } from '../../api/query';
import { RootState } from '../../redux/store';
import { clearSentValue } from '../../redux/inputSlice';

type SurveyProps = {
  id: number;
};

const Survey: React.FC<SurveyProps> = ({ id }) => {
  const inputValue = useSelector((state: RootState) => state.input.sentValue);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [thumbUp, setThumbUp] = useState(false);
  const [thumbDown, setThumbDown] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null);
  const [feedbackDetail, setFeedbackDetail] = useState<string>('');
  const [flag, setFlag] = useState(false);

  const handleThumbUpClick = async () => {
    try {
      setThumbUp(!thumbUp);
      if (thumbDown) setThumbDown(false);
      if (thumbUp) {
        const response = await rateFAQ({
          faq_id: id,
          rating: 1,
          feedback_reason: '',
          feedback_detail: '',
          language: isKorean ? 'ko' : 'en',
        });
        console.log(response);
      }
      clearSentValue();
      setFlag(false);
      alert(
        isKorean
          ? '피드백이 성공적으로 전송되었습니다.'
          : 'Feedback sent successfully!'
      );
    } catch (error) {
      console.error('Error rating FAQ (Thumb Up):', error);
    }
  };

  const handleSendFeedback = async () => {
    try {
      if (thumbDown) {
        const response = await rateFAQ({
          faq_id: id,
          rating: -1,
          feedback_reason: feedbackReason || '',
          feedback_detail: feedbackDetail || '',
          language: isKorean ? 'ko' : 'en',
        });
        console.log(response);
        clearSentValue();
        setFeedbackReason('');
        setFeedbackDetail('');
        setFlag(true);
        alert(
          isKorean
            ? '피드백이 성공적으로 전송되었습니다.'
            : 'Feedback sent successfully!'
        );
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-[365px] items-center bg-gray-100 font-5medium text-[#686D76] text-[18px] mt-[10px] rounded-[20px] px-[20px] py-[10px]">
        <p>
          {isKorean ? '호빗의 응답이 도움이 되었어요!' : 'Was hoBIT helpful?'}
        </p>
        <div className="flex justify-end ml-auto">
          <div className="bg-white p-[10px] rounded-full cursor-pointer hover:bg-gray-200">
            <TbThumbUpFilled
              onClick={handleThumbUpClick}
              className={thumbUp ? 'text-[#E55604]' : 'text-gray-400'}
            />
          </div>
          <div className="bg-white p-[10px] rounded-full ml-[15px] cursor-pointer hover:bg-gray-200">
            <TbThumbDownFilled
              onClick={() => {
                setThumbDown(!thumbDown);
                if (thumbUp) setThumbUp(false);
              }}
              className={thumbDown ? 'text-[#E55604]' : 'text-gray-400'}
            />
          </div>
        </div>
      </div>
      {thumbDown && !flag && (
        <div className="flex flex-col w-[365px] bg-gray-100 font-4regular text-[#686D76] text-[18px] mt-[10px] rounded-[20px] px-[20px] py-[10px] ">
          <p className="font-5medium">
            {isKorean
              ? '도움이 되지 않은 이유가 무엇인가요?'
              : 'What is the reason for your unsatisfaction?'}
          </p>
          <div className="w-full h-[1px] bg-gray-300 mt-[10px] mb-[5px]" />
          <form>
            {[
              {
                value: 'unrelated',
                label: isKorean ? '질문과 무관한 답변' : 'Unrelated Answer',
              },
              {
                value: 'duplicate',
                label: isKorean ? '중복된 답변' : 'Duplicate Answer',
              },
              {
                value: 'incorrect',
                label: isKorean ? '정보가 잘못됨' : 'Incorrect Information',
              },
              {
                value: 'insufficient',
                label: isKorean ? '정보가 부족함' : 'Insufficient Information',
              },
              {
                value: 'unclear',
                label: isKorean
                  ? '내용이 이해하기 어려움'
                  : 'Difficult to Understand',
              },
              { value: 'other', label: isKorean ? '기타' : 'Other' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center mt-[10px] cursor-pointer hover:text-black"
              >
                <input
                  type="radio"
                  name="feedback"
                  value={option.value}
                  onChange={() => setFeedbackReason(option.value)}
                  className="mr-[10px]"
                />
                {option.label}
              </label>
            ))}
          </form>
          <textarea
            placeholder={
              isKorean
                ? '여기에 피드백을 작성해주세요!'
                : 'Please write your feedback here!'
            }
            rows={4}
            value={feedbackDetail}
            onChange={(e) => setFeedbackDetail(e.target.value)}
            className="my-[10px] w-full border-none bg-white font-4regular text-[18px] rounded-[20px] px-[15px] py-[10px] focus:outline-none focus:border-[#F075AA] resize-none"
          />
          <button
            onClick={handleSendFeedback}
            className="bg-gray-200 rounded-[10px] font-5medium py-[5px] mb-[10px] cursor-pointer hover:bg-gray-300 "
          >
            {isKorean ? '제출' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Survey;
