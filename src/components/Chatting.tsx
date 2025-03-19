import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import HelloHobit from './chat/HelloHobit';
import GeneralResponse from './chat/GeneralResponse';
import FAQResponse from './chat/FAQResponse';
import AllCategoriesResponse from './chat/AllCategoriesResponse';
import SeniorResponse from './chat/SeniorResponse';
import Query from './chat/Query';
import { RootState } from '../redux/store';
import { Faq } from '../types/faq';
import { sendQuestion, getAllQuestions } from '../api/query';
import { setQuestions } from '../redux/questionsSlice';
import { resetHomeClicked } from '../redux/homeSlice';
import { clearSent } from '../redux/inputSlice';
import GreetResponse from './chat/GreetResponse';
import { setId } from '../redux/inputSlice';

interface ChatItem {
  query: string;
  response: Faq[];
  loading: boolean;
  flag: boolean;
  seniorMode: number;
  is_greet: boolean;
  is_able: boolean;
}

const Chatting: React.FC = () => {
  const dispatch = useDispatch();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sentValue = useSelector((state: RootState) => state.input.sentValue);
  const sent = useSelector((state: RootState) => state.input.sent);
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const homeClicked = useSelector((state: RootState) => state.home.homeClicked);
  const feedbackClicked = useSelector(
    (state: RootState) => state.feedback.feedbackClicked
  );
  const seniorFaqId = useSelector(
    (state: RootState) => state.seniorFaqId.seniorFaqId
  );

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const newChatItemRef = useRef<ChatItem | null>(null);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await getAllQuestions();
        dispatch(setQuestions(response.questions));
      } catch (err) {
        console.error('Error while fetching all questions:', err);
        setError(err as string);
      }
    };

    fetchAllQuestions();
  }, [dispatch]);

  useEffect(() => {
    if (homeClicked && chatContainerRef.current) {
      const container = chatContainerRef.current;
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }, 500);
    }
  }, [homeClicked]);

  useEffect(() => {
    if (feedbackClicked && chatContainerRef.current) {
      const container = chatContainerRef.current;
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }, 500);
    }
  }, [feedbackClicked]);

  useLayoutEffect(() => {
    if (chatContainerRef.current && newChatItemRef.current) {
      const container = chatContainerRef.current;
      setTimeout(
        () =>
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          }),
        500
      );
      newChatItemRef.current = null;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!sentValue || !sent) return;

    dispatch(clearSent());

    const newChatItem: ChatItem = {
      query: sentValue,
      response: [],
      loading: true,
      flag: false,
      seniorMode: -1,
      is_greet: false,
      is_able: false,
    };

    newChatItemRef.current = newChatItem;
    setChatHistory((prevHistory) => [...prevHistory, newChatItem]);

    const fetchResponse = async () => {
      try {
        const language = isKorean ? 'KO' : 'EN';
        const serverResponse = await sendQuestion(sentValue, language);
        if (serverResponse && serverResponse.id >= 0) {
          dispatch(setId(serverResponse.id));
        }

        if (serverResponse && Array.isArray(serverResponse.faqs)) {
          if (serverResponse.is_greet) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.query === sentValue
                  ? {
                      ...item,
                      response: serverResponse.faqs,
                      loading: false,
                      is_greet: true,
                    }
                  : item
              )
            );
          } else if (serverResponse.is_able) {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.query === sentValue
                  ? {
                      ...item,
                      response: serverResponse.faqs,
                      loading: false,
                      is_greet: false,
                      is_able: true,
                    }
                  : item
              )
            );
          } else {
            setChatHistory((prevHistory) =>
              prevHistory.map((item) =>
                item.query === sentValue
                  ? { ...item, response: serverResponse.faqs, loading: false }
                  : item
              )
            );
          }
        } else {
          console.error('Invalid response structure:', serverResponse);
          setError('Invalid response structure');
        }
      } catch (err) {
        console.error('Error while fetching response:', err);
        setError(err as string);
        setChatHistory((prevHistory) =>
          prevHistory.map((item) =>
            item.query === sentValue ? { ...item, loading: false } : item
          )
        );
      }
    };

    fetchResponse();
  }, [sentValue, sent]);

  useEffect(() => {
    if (seniorFaqId !== null && seniorFaqId !== undefined) {
      const newChatItem: ChatItem = {
        query: '',
        response: [],
        loading: false,
        flag: false,
        seniorMode: seniorFaqId,
        is_greet: false,
        is_able: false,
      };
      newChatItemRef.current = newChatItem;
      setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
    }
  }, [seniorFaqId]);

  useEffect(() => {
    if (homeClicked) {
      const newChatItem: ChatItem = {
        query: '',
        response: [],
        loading: false,
        flag: true,
        seniorMode: -1,
        is_greet: false,
        is_able: false,
      };

      setChatHistory((prevHistory) => [...prevHistory, newChatItem]);
      dispatch(resetHomeClicked());
    }
  }, [homeClicked, dispatch]);

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col h-full max-h-[calc(100vh-140px)] overflow-y-auto px-[20px] py-[30px]"
    >
      <HelloHobit />
      {chatHistory.map((chatItem, index) => (
        <div key={index}>
          {chatItem.seniorMode >= 0 ? (
            <div className="mt-[40px]">
              <SeniorResponse seniorFaqId={chatItem.seniorMode} />
            </div>
          ) : chatItem.flag ? (
            <div className="mt-[40px]">
              <HelloHobit />
            </div>
          ) : (
            <>
              <Query text={chatItem.query} />
              {chatItem.query === '자주 묻는 질문' ||
              chatItem.query === 'FAQ' ? (
                <FAQResponse />
              ) : chatItem.query === '할 수 있는 일' ||
                chatItem.query === 'What I Can Do' ? (
                <AllCategoriesResponse />
              ) : chatItem.is_greet == true ? (
                <GreetResponse />
              ) : chatItem.is_able == true ? (
                <AllCategoriesResponse />
              ) : (
                <GeneralResponse
                  faqs={chatItem.response}
                  loading={chatItem.loading}
                />
              )}
            </>
          )}
        </div>
      ))}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};

export default Chatting;
