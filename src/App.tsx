import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { useEffect, useState, ReactNode } from 'react';
import store from './redux/store';
import MainPage from './pages/MainPage';
import homeImage from './assets/home_image.png';
import helloImage from './assets/hello.png';
import { setImages } from './redux/imageSlice';

interface PreloadImagesProps {
  children: ReactNode;
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const imagesToLoad = { homeImage, helloImage };
    const loadedImages: { [key: string]: string } = {};
    let loadedCount = 0;

    Object.entries(imagesToLoad).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages[key] = img.src;
        loadedCount++;
        if (loadedCount === Object.keys(imagesToLoad).length) {
          dispatch(setImages(loadedImages));
          setLoaded(true);
        }
      };
    });
  }, [dispatch]);

  return loaded ? <>{children}</> : <div>Loading images...</div>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <PreloadImages>
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </PreloadImages>
      </Router>
    </Provider>
  );
};

export default App;
