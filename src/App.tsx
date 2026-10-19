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
import { DialogHost } from './components/ui/Dialog';
import './loader.css';

const SERVER_URL =
	process.env.REACT_APP_HOBIT_BACKEND_ENDPOINT || 'http://localhost:4000';

const PRELOADED: HTMLImageElement[] = [];

interface PreloadImagesProps {
	children: ReactNode;
}

const PreloadImages: React.FC<PreloadImagesProps> = ({ children }) => {
	const dispatch = useDispatch();
	const [loaded, setLoaded] = useState(false);
	const [serverOk, setServerOk] = useState<boolean | null>(null);
	const [maintenance, setMaintenance] = useState<string | null>(null); // 서버가 "점검 중"(503)이라고 알려줄 때

	// 서버 연결 체크
	useEffect(() => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);

		fetch(`${SERVER_URL}/health`, { signal: controller.signal })
			.then(async (res) => {
				clearTimeout(timeout);
				if (res.status === 503) {
					const body = await res.json().catch(() => null);
					if (body?.maintenance) setMaintenance(body.message || '서비스 점검 중이에요.');
				}
				if (!res.ok) throw new Error();
				setServerOk(true);
			})
			.catch(() => {
				setServerOk(false);
			});
	}, []);

	// 이미지 preload — 다운로드뿐 아니라 decode()까지 끝내 두어 처음 그릴 때 끊기지 않게.
	// 하나가 실패해도 로딩 화면에 갇히지 않도록 allSettled.
	useEffect(() => {
		if (serverOk !== true) return;

		const imagesToLoad = { homeImage, helloImage, profileImage, errorImage };
		Promise.allSettled(
			Object.entries(imagesToLoad).map(async ([key, src]) => {
				const img = new Image();
				img.src = src;
				PRELOADED.push(img); // 참조를 유지해 디코딩된 이미지가 캐시에 남도록
				await img.decode();
				return [key, img.src] as const;
			})
		).then((results) => {
			const loadedImages: { [key: string]: string } = {};
			results.forEach((r, i) => {
				const [key, src] = Object.entries(imagesToLoad)[i];
				loadedImages[key] = r.status === 'fulfilled' ? r.value[1] : src;
			});
			dispatch(setImages(loadedImages));
			setLoaded(true);
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
		return maintenance ? <ErrorPage title="잠시 쉬어가요" message={maintenance} /> : <ErrorPage />;
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
				<DialogHost />
			</Router>
		</Provider>
	);
};

export default App;