import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue, clearSentValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';
import { Faq } from '../../types/faq';

interface ResponseProps {
	faqs: Faq[];
	text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
	const dispatch = useDispatch();
	const isKorean = useSelector((state: RootState) => state.language.isKorean);

	const handleSendKeyword = (message: string) => {
		dispatch(sendInputValue(message));

		//setTimeout(() => {
		//  dispatch(clearSentValue());
		//}, 100);
	};

	return (
		<>
			<div className="bg-gray-100 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block">
				{text &&
					text
						.split('\n')
						.map((line, index) =>
							line === '' ? <br key={index} /> : <p key={index}>{line}</p>
						)}
			</div>
			{faqs.length > 0 && (
				<div className="flex flex-col">
					{faqs.map((faq, index) => (
						<div
							key={index}
							onClick={() =>
								handleSendKeyword(isKorean ? faq.question_ko : faq.question_en)
							}
							className="border border-gray-300 font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[15px] w-fit max-w-[400px] break-words inline-block
              hover:bg-gray-100 transition-colors mr-[10px] cursor-pointer"
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
