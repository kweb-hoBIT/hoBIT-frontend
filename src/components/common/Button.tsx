interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: 'contained' | 'text';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  buttonType,
  ...props
}) => {
  const textClass = 'text-[16px] sm:text-[18px] md:text-[20px]';
  return (
    <button
      className={`${className} ${buttonType === 'contained' ? 'bg-gray-100' : 'bg-transparent'}  text-[#686D76] font-6semibold ${textClass} px-[5px] py-[5px] hover:text-black`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
