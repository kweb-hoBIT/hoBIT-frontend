interface QueryProps {
  text: string;
}

const Query: React.FC<QueryProps> = ({ text }) => {
  return (
    <span className="inline-block max-w-[350px] break-words self-start ml-auto bg-[#750E21] w-auto font-5medium text-[20px] text-white px-[20px] py-[7px] rounded-[20px] my-[20px]">
      {text}
    </span>
  );
};

export default Query;
