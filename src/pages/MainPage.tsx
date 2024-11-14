import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import Header from '../components/Header';
import Input from '../components/Input';
import KeywordRecommend from '../components/KeywordRecommend';
import AutoComplete from '../components/AutoComplete';
import Chatting from '../components/Chatting';

const MainPage: React.FC = () => {
  const inputValue = useSelector((state: RootState) => state.input.value);

  return (
    <div>
      <Header />
      <Chatting />
      {inputValue === '' ? <KeywordRecommend /> : <AutoComplete />}
      <Input />
    </div>
  );
};

export default MainPage;
