import profileImg from '../../assets/profile_image.png';

const SeniorHobitProfile: React.FC = () => {
	return (
		<div className="flex flex-row items-center justify-start">
			<img
				src={profileImg}
				alt="Profile"
				className="w-[50px] h-[50px] rounded-full"
			/>
			<p className="font-8extrabold text-[20px] text-[#686D76] pl-[15px]">
				hoBIT
			</p>
		</div>
	);
};

export default SeniorHobitProfile;
