const Text = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`text-[12px] xs:text-[16px] sm:text-[18px] md:text-[20px] ${className}`}
    >
      {children}
    </div>
  );
};

export default Text;
