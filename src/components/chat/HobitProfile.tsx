import profileImg from '../../assets/profile_image.png';

const HobitProfile: React.FC = () => {
  return (
    <div className="flex flex-row items-center justify-start">
      <img
        src={profileImg}
        alt="Profile"
        className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full"
      />
      <p className="font-8extrabold text-lg md:text-[20px] text-[#686D76] pl-[15px]">
        hoBIT
      </p>
    </div>
  );
};

export default HobitProfile;
