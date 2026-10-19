import { useDispatch, useSelector } from 'react-redux';

import { sendFaqById } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import { Faq } from '../../types/faq';

interface ResponseProps {
	faqs: Faq[];
	text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
	const dispatch = useDispatch();
	const isKorean = useSelector((state: RootState) => state.language.isKorean);

	// FAQ 클릭은 id로 행정실 답변을 바로 조회 (LLM 거치지 않음)
	const handleSendFaq = (faq: Faq) => {
		dispatch(sendFaqById({ id: faq.id, query: isKorean ? faq.question_ko : faq.question_en }));
	};

	return (
		<>
			<div className="bg-card font-5medium text-f-base-xl mt-[10px] rounded-[20px] px-[20px] py-[15px] w-fit max-w-[330px] md:max-w-md break-words inline-block">
				{text &&
					text
						.split('\n')
						.map((line, index) =>
							line === '' ? <br key={index} /> : <p key={index}>{line}</p>
						)}
			</div>
			{faqs.length > 0 && (
				<div className="flex flex-col w-full">
					{faqs.map((faq, index) => (
						<div
							key={index}
							onClick={() => handleSendFaq(faq)}
							className="border border-line font-5medium text-f-base-xl mt-[10px] rounded-[20px] px-[20px] py-[15px] w-fit max-w-[330px] md:max-w-md break-words inline-block
              hover:bg-card transition-colors cursor-pointer"
						>
							<p>{isKorean ? faq.question_ko : faq.question_en}</p>
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default Response;
