interface QueryProps {
  text: string;
}

const Query: React.FC<QueryProps> = ({ text }) => {
  return (
    <div className="flex ml-auto w-fit inline-block max-w-[75vw] md:max-w-md break-words bg-[#750E21] font-5medium text-lg md:text-xl text-white px-[20px] py-[10px] rounded-[20px] my-[20px]">
      {text}
    </div>
  );
};

export default Query;
