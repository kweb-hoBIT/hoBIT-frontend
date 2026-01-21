import errorImage from '../assets/error_image.png';

const ErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <img
        src={errorImage}
        alt="Server Error"
        className="w-48 md:w-64 mb-6"
      />
      <h1 className="text-xl md:text-2xl font-semibold mb-2 text-center">
        서버에 연결할 수 없습니다
      </h1>
      <p className="text-sm md:text-base text-gray-600 mb-6 text-center">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        새로고침
      </button>
    </div>
  );
};

export default ErrorPage;