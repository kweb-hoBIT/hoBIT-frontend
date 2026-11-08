import { useEffect, useState } from 'react';

/**
 * 자리표시(스켈레톤) — 데이터가 오기 전 자리를 미리 잡아 두어, 도착했을 때 화면이 밀리지 않게.
 * 0.15초 안에 끝나는 빠른 응답에서는 보이지 않음 (index.css .hobit-skel: 0.15초 뒤 서서히 나타나 은은하게 깜빡임)
 */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties; tone?: 'card' | 'senior' }> = ({
  className = '', style, tone = 'card',
}) => <span aria-hidden="true" className={`hobit-skel block ${tone === 'senior' ? 'bg-senior' : 'bg-card'} ${className}`} style={style} />;

/** active가 ms(기본 0.15초) 넘게 이어질 때만 true — 금방 끝나는 로딩에서 스피너가 번쩍이지 않게 */
export const useDelayed = (active: boolean, ms = 150): boolean => {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const id = window.setTimeout(() => setShown(true), ms);
    return () => window.clearTimeout(id);
  }, [active, ms]);
  return active && shown;
};

/** 0.15초 뒤에야 나타나는 작은 회전 표시 (자리는 처음부터 차지) */
export const DelayedSpinner: React.FC<{ className?: string; label?: string }> = ({ className = '', label }) => {
  const shown = useDelayed(true);
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center justify-center ${className}`}>
      <span
        className={`h-[26px] w-[26px] animate-spin rounded-full border-[3px] border-line border-t-accent-ink transition-opacity duration-200 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </span>
  );
};
