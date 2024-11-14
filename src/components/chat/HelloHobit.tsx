import HobitProfile from './HobitProfile';
import MainOptions from './MainOptions';
import Response from './Response';

const HelloHobit: React.FC = () => {
  return (
    <div>
      <HobitProfile />
      <MainOptions />
      <Response
        text={`안녕하세요\n저는 고려대학교 정보대학 챗봇\n호빗(hoBIT)이에요!\n\n정보대학 관련 궁금한 점이 생기면\n언제든지 저에게 질문해주세요`}
      />
    </div>
  );
};

export default HelloHobit;
