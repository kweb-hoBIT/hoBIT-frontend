import HobitProfile from './HobitProfile';
import Response from './Response';
import Survey from './Survey';

const HobitResponse: React.FC = () => {
  return (
    <div>
      <HobitProfile />
      <Response text="응답" />
      <Survey />
    </div>
  );
};

export default HobitResponse;
