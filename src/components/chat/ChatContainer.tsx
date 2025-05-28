interface ChatContainerProps {
  type?: 'response' | 'query' | 'faq';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const containerClasses = {
  response: 'bg-gray-100',
  query:
    'bg-[#750E21] ml-auto w-fit inline-block px-[20px] py-[10px] my-[20px] items-center',
  faq: 'max-w-[300px] md:max-w-[400px] faq-item border border-gray-300 font-5medium w-fit mt-[10px] rounded-[20px] px-[20px] py-[15px] max-w-[400px] break-words inline-block hover:bg-gray-100 transition-colors mr-[10px] cursor-pointer items-center',
};

const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
  type = 'response',
  onClick,
}) => {
  const containerClass = containerClasses[type];

  return (
    <div
      className={`${containerClass} max-w-[250px] md:max-w-[330px] h-auto mt-[20px] rounded-[20px] flex flex-col  p-[20px] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
