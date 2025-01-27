import { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';

import HobitProfile from './HobitProfile';
import Response from './Response';
import { Faq } from '../../types/faq';

const GreetResponse: React.FC = () => {
	const [mocks, _setMocks] = useState<Faq[]>([]);
	const isKorean = useSelector((state: RootState) => state.language.isKorean);

	return (
		<div>
			<HobitProfile />
			<Response
				text={isKorean ? `안녕하세요 호빗입니다!` : `Hello this is hoBIT!`}
				faqs={mocks}
			/>
		</div>
	);
};

export default GreetResponse;
