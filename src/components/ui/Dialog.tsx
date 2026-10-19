import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';

/**
 * 앱 공통 알림창 — 브라우저 기본 alert/confirm 대신 사용 (기기·브라우저마다 모양이 달라 앱 디자인과 어긋났음)
 *   if (await appConfirm('지울까요?', { danger: true })) { ... }
 *   appAlert('전송되었습니다.');
 * 화면에는 <DialogHost />가 한 번만 있으면 됨 (App.tsx). 여러 개가 동시에 오면 차례로 보여줌.
 */
type DialogRequest = {
  kind: 'alert' | 'confirm';
  message: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
};

let enqueue: ((request: DialogRequest) => void) | null = null;

export const appConfirm = (message: string, options?: { danger?: boolean }) =>
  new Promise<boolean>((resolve) => {
    if (enqueue) enqueue({ kind: 'confirm', message, danger: options?.danger, resolve });
    else resolve(window.confirm(message)); // DialogHost가 아직 없을 때만
  });

export const appAlert = (message: string) =>
  new Promise<void>((resolve) => {
    if (enqueue) enqueue({ kind: 'alert', message, resolve: () => resolve() });
    else {
      window.alert(message);
      resolve();
    }
  });

export const DialogHost: React.FC = () => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const current = queue[0];

  useEffect(() => {
    enqueue = (request) => setQueue((q) => [...q, request]);
    return () => {
      enqueue = null;
    };
  }, []);

  useEffect(() => {
    confirmRef.current?.focus(); // Enter = 확인, Esc = 취소
  }, [current]);

  if (!current) return null;

  const close = (ok: boolean) => {
    current.resolve(ok);
    setQueue((q) => q.slice(1));
  };

  return (
    <div
      role="presentation"
      onClick={() => close(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-[16px]"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={current.message}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && close(false)}
        className="hobit-appear w-full max-w-[340px] md:max-w-[420px] rounded-[20px] bg-surface px-[22px] md:px-[26px] pt-[22px] md:pt-[26px] pb-[16px] md:pb-[20px] shadow-xl"
      >
        <p className="whitespace-pre-line break-keep font-5medium text-f-base text-ink">
          {current.message}
        </p>
        <div className="mt-[20px] flex justify-end gap-[8px]">
          {current.kind === 'confirm' && (
            <button
              type="button"
              onClick={() => close(false)}
              className="rounded-full bg-card px-[16px] md:px-[20px] py-[8px] md:py-[10px] text-f-sm font-5medium text-ink-2 hover:bg-card-2 outline-none focus-visible:ring-2 focus-visible:ring-line"
            >
              {isKorean ? '취소' : 'Cancel'}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            onClick={() => close(true)}
            className="rounded-full bg-accent px-[16px] md:px-[20px] py-[8px] md:py-[10px] text-f-sm font-5medium text-white hover:bg-accent/85 outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2"
          >
            {current.kind === 'confirm' && current.danger ? (isKorean ? '지우기' : 'Delete') : isKorean ? '확인' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
