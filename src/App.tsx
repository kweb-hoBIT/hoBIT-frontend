import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { useEffect, useState, ReactNode } from 'react';
import store from './redux/store';
import MainPage from './pages/MainPage';
import ErrorPage from './pages/ErrorPage';
import homeImage from './assets/home_image.png';
import helloImage from './assets/hello.png';
import profileImage from './assets/profile_image.png';
import errorImage from './assets/error_image.png';
import { setImages } from './redux/imageSlice';
import './loader.css';

const SERVER_URL =
	process.env.REACT_APP_HOBIT_BACKEND_ENDPOINT || 'http://localhost:4000';

interface PreloadImagesProps {
	children: ReactNode;
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ children }) => {
	const dispatch = useDispatch();
	const [loaded, setLoaded] = useState(false);
	const [serverOk, setServerOk] = useState<boolean | null>(null);

	// 서버 연결 체크
	useEffect(() => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);

		fetch(`${SERVER_URL}/health`, { signal: controller.signal })
			.then((res) => {
				clearTimeout(timeout);
				if (!res.ok) throw new Error();
				setServerOk(true);
			})
			.catch(() => {
				setServerOk(false);
			});
	}, []);

	// 이미지 preload
	useEffect(() => {
		if (serverOk !== true) return;

		const imagesToLoad = { homeImage, helloImage, profileImage, errorImage };
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
	}, [dispatch, serverOk]);

	// ⏳ 서버 체크 중
	if (serverOk === null) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="loader"></div>
			</div>
		);
	}

	// 서버 연결 실패
	if (serverOk === false) {
		return <ErrorPage />;
	}

	// 정상
	return loaded ? (
		<>{children}</>
	) : (
		<div className="flex items-center justify-center h-screen">
			<div className="loader"></div>
		</div>
	);
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