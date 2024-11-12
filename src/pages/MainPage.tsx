import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Input from '../components/Input';
import KeywordRecommend from '../components/KeywordRecommend';
import AutoComplete from '../components/AutoComplete';
import { RootState } from '../redux/store';

const MainPage: React.FC = () => {
  const inputValue = useSelector((state: RootState) => state.input.value);

  return (
    <div>
      <Header />
      {inputValue === '' ? <KeywordRecommend /> : <AutoComplete />}
      <Input />
    </div>
  );
};

export default MainPage;
