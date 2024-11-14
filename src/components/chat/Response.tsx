interface ResponseProps {
  text: string;
}

const Response: React.FC<ResponseProps> = ({ text }) => {
  return (
    <div className="bg-[#eeeeee] font-6semibold text-[#686D76] text-[20px] mt-[10px] rounded-[20px] p-[20px] max-w-[350px] break-words inline-block">
      {text
        .split('\n')
        .map((line, index) =>
          line === '' ? <br key={index} /> : <p key={index}>{line}</p>
        )}
    </div>
  );
};

export default Response;
