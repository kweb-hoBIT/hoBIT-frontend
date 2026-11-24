import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IoClose, IoSparkles } from 'react-icons/io5';
import { RootState } from '../redux/store';
import mascotHi from '../assets/mascot_hi.webp';

/**
 * 새 호빗(beta.hobit.kr) 베타 오픈 안내 — 접속할 때마다 띄움
 * '다시 보지 않기'를 누르면 이 브라우저에 기록해 더 띄우지 않음. 닫기(X·바깥·ESC)는 이번만 닫음
 */
const BETA_URL = 'https://beta.hobit.kr';
// v2: '한 번만'(v1)에서 '다시 보지 않기를 누를 때까지'로 바꾸며 새 이름 — v1로 닫은 사람에게도 다시 보임
const SEEN_KEY = 'hobit_beta_notice_hidden_v2';

const seen = () => {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* 저장이 막혀 있으면 넘어감 */
  }
};

const BetaNotice: React.FC = () => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [open, setOpen] = useState(false);

  // 그림을 디코딩까지 마친 뒤 열어 모달과 그림이 한 번에 보이게 (App에서 미리 받아 두어 보통 바로 끝남)
  useEffect(() => {
    if (seen()) return;
    let alive = true;
    const img = new Image();
    img.src = mascotHi;
    const show = () => alive && setOpen(true);
    (img.decode ? img.decode() : Promise.resolve()).then(show, show);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false); // 이번만 닫기
  const hideForever = () => {
    markSeen();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="beta-notice-title">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full max-w-[360px] rounded-[24px] bg-white px-6 pt-5 pb-6 text-center shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label={isKorean ? '닫기' : 'Close'}
          className="absolute right-4 top-4 rounded-full p-1 text-[22px] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <IoClose />
        </button>
        <img src={mascotHi} alt="" className="mx-auto h-[140px] w-[140px] object-contain" />
        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FFEFEF] px-3 py-1 text-[13px] font-6semibold text-[#750E21]">
          <IoSparkles /> {isKorean ? '베타 오픈' : 'Beta is open'}
        </p>
        <h2 id="beta-notice-title" className="mt-3 text-[21px] font-7bold text-gray-900">
          {isKorean ? '새로워진 호빗을 먼저 만나 보세요' : 'Try the new hoBIT first'}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
          {isKorean ? (
            <>
              더 정확한 답변, 최신 공지 안내,
              <br />
              학식·셔틀·주변 장소까지 새 호빗에서 물어보세요.
            </>
          ) : (
            <>More accurate answers, the latest notices, plus cafeteria menus, shuttles and nearby places.</>
          )}
        </p>
        <a
          href={BETA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="mt-5 block w-full rounded-[14px] bg-[#750E21] py-3 text-[16px] font-6semibold text-white hover:bg-[#5e0b1a]"
        >
          {isKorean ? '베타 써 보기' : 'Try the beta'}
        </a>
        <div className="mt-3 flex items-center justify-between text-[14px] text-gray-500">
          <button type="button" onClick={hideForever} className="py-1 hover:text-gray-700 hover:underline">
            {isKorean ? '다시 보지 않기' : "Don't show again"}
          </button>
          <button type="button" onClick={close} className="py-1 hover:text-gray-700">
            {isKorean ? '닫기' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetaNotice;
