import { useState } from 'react';
import { sendChat } from '../api/query';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

/**
 * 간단한 LLM 채팅 컴포넌트 (RAG 없이)
 * 
 * 사용 예시:
 * 1. MainPage.tsx 또는 다른 페이지에서 import
 * 2. <SimpleLLMChat />으로 사용
 */
const SimpleLLMChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const language = isKorean ? 'KO' : 'EN';
      const response = await sendChat(userMessage, language);
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response },
      ]);
    } catch (error) {
      console.error('Error sending chat:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: isKorean 
            ? '죄송합니다. 오류가 발생했습니다.' 
            : 'Sorry, an error occurred.' 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isKorean ? 'hoBIT 챗봇 (LLM)' : 'hoBIT Chatbot (LLM)'}
      </h1>
      
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-card mr-auto max-w-[80%]'
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === 'user' 
                ? (isKorean ? '나' : 'You') 
                : 'hoBIT'}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-card p-3 rounded-lg mr-auto max-w-[80%]">
            <p className="text-sm font-semibold mb-1">hoBIT</p>
            <p>{isKorean ? '입력 중...' : 'Typing...'}</p>
          </div>
        )}
      </div>

      {/* 입력란 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isKorean ? '메시지를 입력하세요...' : 'Type a message...'}
          className="flex-1 p-2 border rounded-lg"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-card-3"
        >
          {isKorean ? '전송' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default SimpleLLMChat;
