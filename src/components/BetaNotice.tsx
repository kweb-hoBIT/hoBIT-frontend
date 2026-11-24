import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IoClose, IoSparkles } from 'react-icons/io5';
import { RootState } from '../redux/store';
import mascotHi from '../assets/mascot_hi.webp';

/**
 * 새 호빗(beta.hobit.kr) 베타 오픈 안내 — 처음 접속했을 때 한 번만
 * 닫으면 이 브라우저에 기록해 다시 띄우지 않음 (저장이 막힌 브라우저면 매번 뜰 수 있음)
 */
const BETA_URL = 'https://beta.hobit.kr';
const SEEN_KEY = 'hobit_beta_notice_seen_v1';

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

  useEffect(() => {
    if (!seen()) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
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
        <button type="button" onClick={close} className="mt-2 w-full py-2 text-[14px] text-gray-500 hover:text-gray-700">
          {isKorean ? '지금은 괜찮아요' : 'Not now'}
        </button>
      </div>
    </div>
  );
};

export default BetaNotice;
