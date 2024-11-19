import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import Header from '../components/Header';
import Input from '../components/Input';
import KeywordRecommend from '../components/KeywordRecommend';
import AutoComplete from '../components/AutoComplete';
import Chatting from '../components/Chatting';
import FAQCard from '../components/FAQCard';

const MainPage: React.FC = () => {
  const isEmpty = useSelector((state: RootState) => state.input.isEmpty);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div>
        <Chatting />
      </div>
      {isEmpty ? <KeywordRecommend /> : <AutoComplete />}
      <FAQCard />
      <Input />
    </div>
  );
};

export default MainPage;
