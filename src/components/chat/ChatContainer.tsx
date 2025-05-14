interface ChatContainerProps {
  type?: 'response' | 'query';
  children: React.ReactNode;
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
  type = 'response',
}) => {
  const containerClass =
    type === 'response'
      ? 'bg-gray-100'
      : 'bg-[#750E21] ml-auto w-fit inline-block px-[20px] py-[10px] my-[20px]';

  return (
    <div
      className={`${containerClass} max-w-[250px] md:max-w-[330px] h-auto mt-[20px] rounded-[20px] flex flex-col items-center p-[20px] ${className}`}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
