interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`bg-gray-100 max-w-[250px] md:max-w-[330px] h-auto mt-[20px] rounded-[20px] flex flex-col items-center p-[20px] ${className}`}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
