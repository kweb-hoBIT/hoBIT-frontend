import RecChips from './RecChips';
import { Faq } from '../../types/faq';

interface ResponseProps {
	faqs: Faq[];
	text: string;
}

const Response: React.FC<ResponseProps> = ({ faqs, text }) => {
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
				<RecChips
					items={faqs.map((faq) => ({ intent_id: `faq-${faq.id}`, intent_name: '', text: faq.question_ko,
						text_en: faq.question_en, faq_id: faq.id }))}
					stacked
				/>
			)}
		</>
	);
};

export default Response;
