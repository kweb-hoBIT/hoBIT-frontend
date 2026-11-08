import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import React, { useEffect, useState, ReactNode } from 'react';
import store from './redux/store';
import MainPage from './pages/MainPage';
import ErrorPage from './pages/ErrorPage';
import homeImage from './assets/home_image.png';
import helloImage from './assets/hello.png';
import profileImage from './assets/profile_image.png';
import errorImage from './assets/error_image.png';
import { setImages } from './redux/imageSlice';
import { DialogHost } from './components/ui/Dialog';
import { getStartRecommendations } from './api/query';
import { loadProgram } from './redux/programSlice';

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

	// 시작 화면의 추천 질문은 서버 확인과 동시에 미리 요청 (결과는 query.tsx에 캐시됨)
	const startRecsRef = React.useRef<Promise<unknown> | null>(null);
	if (!startRecsRef.current) startRecsRef.current = getStartRecommendations(loadProgram());

	// 이미지 preload — 다운로드뿐 아니라 decode()까지 끝내 두어 처음 그릴 때 끊기지 않게.
	// 하나가 실패해도 로딩 화면에 갇히지 않도록 allSettled.
	// 추천 질문도 함께 기다림 — 인사말과 칩이 한 번에 보이게 (늦으면 1.2초까지만 기다리고 칩 자리표시로)
	useEffect(() => {
		if (serverOk !== true) return;

		const imagesToLoad = { homeImage, helloImage, profileImage, errorImage };
		const images = Promise.allSettled(
			Object.entries(imagesToLoad).map(async ([key, src]) => {
				const img = new Image();
				img.src = src;
				PRELOADED.push(img); // 참조를 유지해 디코딩된 이미지가 캐시에 남도록
				await img.decode();
				return [key, img.src] as const;
			})
		);
		const recs = Promise.race([
			startRecsRef.current!.catch(() => undefined),
			new Promise((resolve) => window.setTimeout(resolve, 1200)),
		]);
		Promise.all([images, recs]).then(([results]) => {
			const loadedImages: { [key: string]: string } = {};
			results.forEach((r, i) => {
				const [key, src] = Object.entries(imagesToLoad)[i];
				loadedImages[key] = r.status === 'fulfilled' ? r.value[1] : src;
			});
			dispatch(setImages(loadedImages));
			setLoaded(true);
		});
	}, [dispatch, serverOk]);

	// 서버 연결 실패
	if (serverOk === false) {
		return maintenance ? <ErrorPage title="잠시 쉬어가요" message={maintenance} /> : <ErrorPage />;
	}

	// 서버 확인·이미지 준비 중 — index.html의 첫 로딩 화면과 같은 모양을 이어서 (화면이 바뀌며 깜빡이지 않게)
	return loaded ? <>{children}</> : <Splash />;
};

const Splash: React.FC = () => (
	<div className="hobit-splash hobit-splash--cont" role="status" aria-label="호빗을 불러오는 중">
		<div className="hobit-splash__mark">hoBIT</div>
		<div className="hobit-splash__dots" aria-hidden="true">
			<i />
			<i />
			<i />
		</div>
	</div>
);

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