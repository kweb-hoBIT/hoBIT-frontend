import { lazy, Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../redux/store';
import { once } from '../lib/idle';
import { Skeleton } from './ui/Skeleton';

// 메뉴 서랍 내용은 첫 화면에 필요 없어 따로 받음 (한가할 때 미리, 메뉴 버튼에 손을 대면 바로)
export const preloadMenuContent = once(() => import('./MenuContent'));
const MenuContent = lazy(preloadMenuContent);

/** 왼쪽에서 밀려 나오는 메뉴 서랍 — 겉 틀(밀려 나오는 효과)만 첫 화면 번들에, 내용은 처음 열 때 그림 */
const Modal: React.FC = () => {
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  // 한 번 연 뒤에는 닫아도 내용을 남겨 둠 (펼친 카테고리·작성 중인 피드백 유지)
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (isOpen) setOpened(true);
  }, [isOpen]);
  const show = opened || isOpen;

  return (
    <div
      // 겹친 스크롤이 아래 대화 화면으로 넘어가지 않게 (overscroll-contain)
      className={`fixed top-0 left-0 overflow-y-auto overscroll-contain p-[20px] h-full bg-surface shadow-lg z-[60] transform transition-transform duration-500 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-[min(88vw,320px)] md:w-[380px] lg:w-[440px] xl:w-[480px]`}
    >
      {show && (
        <Suspense fallback={<MenuSkeleton />}>
          <MenuContent />
        </Suspense>
      )}
    </div>
  );
};

// 메뉴 코드를 받는 동안 — 제목·내 정보·카테고리 줄 모양의 자리표시
const MenuSkeleton: React.FC = () => (
  <div aria-hidden="true">
    <Skeleton className="h-[28px] w-[120px] rounded-full" />
    <Skeleton className="mt-4 mb-2 h-[48px] w-full rounded-[10px]" />
    <div className="mt-4 flex flex-col gap-[10px]">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-[34px] lg:h-[41px] rounded-[10px]" />
      ))}
    </div>
  </div>
);

export default Modal;
