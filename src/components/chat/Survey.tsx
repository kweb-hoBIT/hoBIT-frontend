import { useDispatch } from 'react-redux';
import { TbThumbUpFilled } from 'react-icons/tb';
import { TbThumbDownFilled } from 'react-icons/tb';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { rateFAQ, moderateContent } from '../../api/query';
import { RootState } from '../../redux/store';
import { clearSentValue } from '../../redux/inputSlice';

import { setFeedbackClicked } from '../../redux/feedbackSlice';
import { check as korcenCheck } from 'korcen';

type SurveyProps = {
  id: number;
  user_question: string;
};

const Survey: React.FC<SurveyProps> = ({ id, user_question }) => {
  const dispatch = useDispatch();
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const rate_id = useSelector((state: RootState) => state.input.id);
  const [thumbUp, setThumbUp] = useState(false);
  const [thumbDown, setThumbDown] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null);
  const [feedbackDetail, setFeedbackDetail] = useState<string>('');
  const [flag, setFlag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbUpClick = async () => {
    try {
      if (thumbUp) {
        // cancel rate
        await rateFAQ({
          id: rate_id,
          user_question,
          faq_id: id,
          rating: 0,
          feedback_reason: '',
          feedback_detail: '',
          language: isKorean ? 'ko' : 'en',
        });
      } else {
        // 확인 팝업 추가
        const confirmed = window.confirm(
          isKorean
            ? '피드백을 전송하시겠습니까?'
            : 'Would you like to send feedback?'
        );
        
        if (!confirmed) {
          return;
        }

        // rate positive
        await rateFAQ({
          id: rate_id,
          user_question,
          faq_id: id,
          rating: 1,
          feedback_reason: '',
          feedback_detail: '',
          language: isKorean ? 'ko' : 'en',
        });

        alert(
          isKorean
            ? '피드백이 성공적으로 전송되었습니다.'
            : 'Feedback sent successfully!'
        );
        
        // 피드백 전송 완료 시 버튼 비활성화
        setFlag(true);
        setThumbUp(true);
        setThumbDown(false);
        return;
      }
      clearSentValue();
      setFlag(false);
      setThumbUp(!thumbUp);
      setThumbDown(false);
    } catch (error) {
      console.error('Error rating FAQ (Thumb Up):', error);
    }
  };

  const handleSendFeedback = async () => {
    try {
      if (!thumbDown) return;

      setIsSubmitting(true);

      const detail = feedbackDetail.trim();

      // feedbackDetail이 있을 때만 검사 수행
      if (detail) {
        // 1차: korcen으로 욕설 검사 (한국어일 때만)
        if (isKorean && korcenCheck(detail)) {
          alert('부적절한 내용이 포함되어 있습니다.');
          return;
        }

        // 2차: OpenAI moderation 검사 (한/영 모두)
        const moderationResult = await moderateContent(detail);
        const allowed = moderationResult?.allowed ?? true;
        const reason = moderationResult?.reason ?? {};

        if (!allowed) {
          const categories = Object.entries(reason)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(', ');
          alert(
            isKorean
              ? `부적절한 내용이 포함되어 있습니다.`
              : `Inappropriate content detected.`
          );
          return;
        }
      }

      if (thumbDown) {
        await rateFAQ({
          id: rate_id,
          user_question,
          faq_id: id,
          rating: -1,
          feedback_reason: feedbackReason || '',
          feedback_detail: feedbackDetail || '',
          language: isKorean ? 'ko' : 'en',
        });
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full max-w-[330px] md:max-w-none md:w-[350px] items-center bg-gray-100 font-5medium text-[#686D76] text-base md:text-lg mt-[10px] rounded-[20px] px-[20px] py-[10px]">
        <p>
          {isKorean ? '호빗의 응답이 도움이 되었어요!' : 'Was hoBIT helpful?'}
        </p>
        <div className="flex justify-end ml-auto">
          <div className={`bg-white p-[8px] md:p-[10px] rounded-full ${flag ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-200'}`}>
            <TbThumbUpFilled
              onClick={flag ? undefined : handleThumbUpClick}
              className={`text-lg md:text-xl ${thumbUp ? 'text-[#E55604]' : 'text-gray-400'}`}
            />
          </div>
          <div className={`bg-white p-[8px] md:p-[10px] rounded-full ml-[10px] md:ml-[15px] ${flag ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-200'}`}>
            <TbThumbDownFilled
              onClick={flag ? undefined : () => {
                setThumbDown(!thumbDown);
                dispatch(setFeedbackClicked());
                if (thumbDown) setFeedbackReason('');
                if (thumbUp) setThumbUp(false);
              }}
              className={`text-lg md:text-xl ${thumbDown ? 'text-[#E55604]' : 'text-gray-400'}`}
            />
          </div>
        </div>
      </div>
      {thumbDown && !flag && (
        <div className="flex flex-col w-full max-w-[330px] md:max-w-none md:w-[350px] bg-gray-100 font-4regular text-[#686D76] text-base md:text-lg mt-[10px] rounded-[20px] px-[20px] py-[10px] ">
          <p className="font-5medium">
            {isKorean
              ? '도움이 되지 않은 이유가 무엇인가요?'
              : 'What is the reason for your unsatisfaction?'}
          </p>
          <div className="w-full h-[1px] bg-gray-300 mt-[10px] mb-[5px]" />
          <form>
            {[
              {
                value: '질문과 무관한 답변',
                label: isKorean ? '질문과 무관한 답변' : 'Unrelated Answer',
              },
              {
                value: '중복된 답변',
                label: isKorean ? '중복된 답변' : 'Duplicate Answer',
              },
              {
                value: '정보가 잘못됨',
                label: isKorean ? '정보가 잘못됨' : 'Incorrect Information',
              },
              {
                value: '정보가 부족함',
                label: isKorean ? '정보가 부족함' : 'Insufficient Information',
              },
              {
                value: '내용이 이해하기 어려움',
                label: isKorean
                  ? '내용이 이해하기 어려움'
                  : 'Difficult to Understand',
              },
              {
                value: '기타',
                label: isKorean ? '기타' : 'Other',
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center mt-[10px] cursor-pointer hover:text-black"
              >
                <input
                  type="radio"
                  name="feedback"
                  value={option.value}
                  checked={feedbackReason === option.value}
                  onClick={() => {
                    if (feedbackReason === option.value) {
                      setFeedbackReason('');
                    } else {
                      setFeedbackReason(option.value);
                    }
                  }}
                  onChange={() => {}}
                  className="mr-[10px] w-4 h-4 md:w-5 md:h-5 accent-[#E55604] cursor-pointer"
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
            onChange={(e) => {
              setFeedbackDetail(e.target.value);
              // 텍스트 입력 시 자동으로 "기타" 선택
              if (e.target.value.trim() && !feedbackReason) {
                setFeedbackReason('기타');
              }
            }}
            className="my-[10px] w-full border-none bg-white font-4regular text-base md:text-lg rounded-[20px] px-[15px] py-[10px] focus:outline-none focus:border-[#F075AA] resize-none"
          />
          <button
            onClick={handleSendFeedback}
            className={`rounded-[10px] font-5medium py-[5px] mb-[10px] cursor-pointer transition ${
              (feedbackReason && !(feedbackReason == '기타')) ||
              (feedbackReason == '기타' && feedbackDetail)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
            disabled={
              isSubmitting ||
              !(
                (feedbackReason && !(feedbackReason == '기타')) ||
                (feedbackReason == '기타' && feedbackDetail)
              )
            }
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isKorean ? '전송 중...' : 'Sending...'}
              </span>
            ) : (
              isKorean ? '제출' : 'Submit'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Survey;
