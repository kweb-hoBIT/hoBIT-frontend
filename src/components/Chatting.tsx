import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import HelloHobit from './chat/HelloHobit';
import GeneralResponse from './chat/GeneralResponse';
import FAQResponse from './chat/FAQResponse';
import AllCategoriesResponse from './chat/AllCategoriesResponse';
import Query from './chat/Query';
import { RootState } from '../redux/store';

const Chatting: React.FC = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const [queries, setQueries] = useState<string[]>([]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [queries]);

  useEffect(() => {
    if (sentValue) {
      setQueries((prevQueries) => [...prevQueries, sentValue]);
    }
  }, [sentValue]);

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-y-auto px-[20px] py-[30px]"
    >
      <HelloHobit />
      {queries.map((query, index) => (
        <>
          <Query key={index} text={query} />
          {query === '자주 묻는 질문' ? (
            <FAQResponse />
          ) : query === '할 수 있는 일' ? (
            <AllCategoriesResponse />
          ) : (
            <GeneralResponse />
          )}
        </>
      ))}
    </div>
  );
};

export default Chatting;
