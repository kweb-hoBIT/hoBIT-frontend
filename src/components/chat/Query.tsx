interface QueryProps {
  text: string;
}

const Query: React.FC<QueryProps> = ({ text }) => {
  return (
    <div className="flex ml-auto w-fit inline-block max-w-[350px] break-words bg-[#750E21] font-5medium text-[20px] text-white px-[20px] py-[10px] rounded-[20px] my-[20px]">
      {text}
    </div>
  );
};

export default Query;
