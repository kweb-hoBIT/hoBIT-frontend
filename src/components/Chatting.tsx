// Chatting.tsx
import React, { useEffect, useRef } from 'react';
import HelloHobit from './chat/HelloHobit';
import Query from './chat/Query';

const Chatting: React.FC = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-y-auto px-[20px] py-[30px]"
    >
      <HelloHobit />
      <Query />
    </div>
  );
};

export default Chatting;
