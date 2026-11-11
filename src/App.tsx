import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import React, { useEffect, useState, ReactNode } from 'react';
import store from './redux/store';
import MainPage from './pages/MainPage';
import ErrorPage from './pages/ErrorPage';
// 호빗 대기 그림 = 움직이는 호빗의 첫 장면 (예전 PNG는 렌더가 달라 움직이기 전에 다른 캐릭터처럼 보였음)
import homeImage from './assets/mascot_main_still.webp';
import helloImage from './assets/mascot_hi_still.webp';
import sadImage from './assets/mascot_sad_still.webp';
import { preloadClip } from './components/chat/Mascot';
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
				// 관리자가 챗봇을 꺼 두었으면 '잠시 쉬어가요' 오류 화면 (우는 호빗)
				const body = await res.json().catch(() => null);
				if (body?.botEnabled === false) {
					setMaintenance(body.message || '호빗이 잠시 쉬고 있어요.');
					throw new Error('bot off');
				}
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

		// sadImage: 답을 못 찾은 답·오류 답의 우는 호빗 첫 장면 — 미리 디코드해 두어 답 카드와 같이 뜨게
		const imagesToLoad = { homeImage, helloImage, profileImage, errorImage, sadImage };
		const images = Promise.allSettled(
			Object.entries(imagesToLoad).map(async ([key, src]) => {
				const img = new Image();
				img.src = src;
				PRELOADED.push(img); // 참조를 유지해 디코딩된 이미지가 캐시에 남도록
				await img.decode();
				return [key, img.src] as const;
			})
		);
		// 시작 화면 손인사(main)도 로딩 화면 동안 받아 둠 — 늦으면 1.5초까지만 기다리고 첫 장면 그림으로 시작
		const mascot = Promise.race([preloadClip('main'), new Promise((resolve) => window.setTimeout(resolve, 1500))]);
		const recs = Promise.race([
			startRecsRef.current!.catch(() => undefined),
			new Promise((resolve) => window.setTimeout(resolve, 1200)),
		]);
		Promise.all([images, recs, mascot]).then(([results]) => {
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

// 첫 화면(index.html)에서 흔들리던 박자를 그대로 이어 가도록 음수 지연으로 위상을 맞춤 (0.4초 등장 후 1.6초 주기)
const bobDelay = () => `-${Math.max(0, performance.now() - 400) % 1600}ms`;

const Splash: React.FC = () => (
	<div
		className="hobit-splash hobit-splash--cont"
		role="status"
		aria-label="호빗을 불러오는 중"
		style={{ '--bob-delay': bobDelay() } as React.CSSProperties}
	>
		<img className="hobit-splash__char" src={`${process.env.PUBLIC_URL}/hobit-splash.png`} width={96} height={96} alt="" />
		<div className="hobit-splash__shadow" aria-hidden="true" />
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