import { IconType } from 'react-icons';
import Text from './Text';

interface IconTextRowProps {
  icon: IconType;
  text: string;
  url?: string;
  type?: 'link' | 'text';
  className?: string;
}

const IconTextRow: React.FC<IconTextRowProps> = ({
  icon: Icon,
  text,
  url,
  type = 'text',
  className = '',
}) => {
  const iconClasses =
    'mr-[10px] text-[24px] xs:text-[28px] sm:text-[36px] text-[#686D76] bg-white p-[8px] rounded-full';
  const containerClasses = `flex flex-row items-center mt-[10px] ${className}`;

  const content = (
    <>
      <Icon
        style={{
          minWidth: '28px',
          minHeight: '28px',
        }}
        className={iconClasses}
      />
      <Text>{text}</Text>
    </>
  );

  if (type === 'link' && url) {
    return (
      <div className={containerClasses}>
        <a
          href={url.startsWith('http') ? url : `http://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center text-[18px] text-[#0A5EB0] cursor-pointer hover:underline break-words"
          style={{ wordBreak: 'break-word' }}
        >
          {content}
        </a>
      </div>
    );
  }

  return <div className={containerClasses}>{content}</div>;
};

export default IconTextRow;
