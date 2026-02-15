import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import profileImg from '../../assets/profile_image.png';

const SeniorHobitProfile: React.FC = () => {
	const isKorean = useSelector((state: RootState) => state.language.isKorean);
	
	return (
    <div className="flex flex-row items-center justify-start">
      <img
        src={profileImg}
        alt="Profile"
        className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full"
      />
      <div className="flex flex-col pl-[15px] gap-1">
        <p className="font-8extrabold text-lg md:text-[20px] text-[#686D76]">
          hoBIT
        </p>
        <span className="px-2 py-0.5 bg-[#FFEFEF] text-red-600 text-xs md:text-sm font-6semibold rounded-full w-fit">
          {isKorean ? '선배모드' : 'Senior'}
        </span>
      </div>
    </div>
  );
};

export default SeniorHobitProfile;
