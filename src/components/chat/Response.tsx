import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';
import { sendQuestion } from '../../api/response';

interface ResponseProps {
  text: string;
}

const Response: React.FC<ResponseProps> = ({ text }) => {
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const [responseText, setResponseText] = useState<string>('');

  useEffect(() => {
    const fetchResponse = async () => {
      if (sentValue) {
        try {
          const response = await sendQuestion(sentValue);
          setResponseText(response);
        } catch (error) {
          console.error('Error fetching response:', error);
          setResponseText('Failed to fetch response from the server.');
        }
      }
    };

    fetchResponse();
  }, [sentValue]);

  return (
    <div className="bg-[#eeeeee] font-5medium text-[20px] mt-[10px] rounded-[20px] px-[20px] py-[7px] max-w-[350px] break-words inline-block">
      {responseText
        .split('\n')
        .map((line, index) =>
          line === '' ? <br key={index} /> : <p key={index}>{line}</p>
        )}
    </div>
  );
};

export default Response;
