import { CiImageOn } from 'react-icons/ci';

import { useDispatch, useSelector } from 'react-redux';

import { sendInputValue } from '../../redux/inputSlice';
import { RootState } from '../../redux/store';

const MainOptions: React.FC = () => {
	const dispatch = useDispatch();
	const isKorean = useSelector((state: RootState) => state.language.isKorean);

	const handleSendOption = (message: string) => {
		dispatch(sendInputValue(message));
	};

	return (
		<div className="bg-gray-100 w-[330px] h-auto mt-[20px] rounded-[20px] flex flex-col items-center p-[20px]">
			<CiImageOn className="text-[#686D76] text-[50px] my-[40px]" />
			<div className="flex w-full justify-between items-center">
				<button
					onClick={() => handleSendOption(isKorean ? '자주 묻는 질문' : 'FAQ')}
					className="w-full text-[#686D76] font-6semibold text-[20px] py-[5px] hover:text-black"
				>
					{isKorean ? '자주 묻는 질문' : 'FAQ'}
				</button>
				<span className="text-[28px] text-gray-400 font-1thin">|</span>
				<button
					onClick={() =>
						handleSendOption(isKorean ? '할 수 있는 일' : 'What I Can Do')
					}
					className="w-full text-[#686D76] font-6semibold text-[20px] py-[5px] hover:text-black"
				>
					{isKorean ? '할 수 있는 일' : 'What I Can Do'}
				</button>
			</div>
		</div>
	);
};

export default MainOptions;
