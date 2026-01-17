import errorImage from '../assets/error_image.png';

const ErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <img
        src={errorImage}
        alt="Server Error"
        className="w-64 mb-6"
      />
      <h1 className="text-2xl font-semibold mb-2">
        서버에 연결할 수 없습니다
      </h1>
      <p className="text-gray-600 mb-6">
        잠시 후 다시 시도해주세요.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        새로고침
      </button>
    </div>
  );
};

export default ErrorPage;