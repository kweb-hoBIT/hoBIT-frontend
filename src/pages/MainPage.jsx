import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Input from '../components/Input';
import KeywordRecommend from '../components/KeywordRecommend';
import AutoComplete from '../components/AutoComplete';

const MainPage = () => {
  const inputValue = useSelector((state) => state.input.value);

  return (
    <div>
      <Header />
      {inputValue === '' ? <KeywordRecommend /> : <AutoComplete />}
      <Input />
    </div>
  );
};

export default MainPage;
