import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 움직이는 호빗 — public/mascot/*.webp (5초, 한 번 재생 후 마지막 장면에서 멈춤, 배경 투명)
 * 원본 영상: hobit_renewal/mascot_src/*.mp4 → 280px·초당 15장 WebP (흰 배경은 테두리와 이어진 부분만 지움)
 *
 * 시작 화면 규칙 (HomeMascot)
 *   홈 버튼(시작 화면이 새로 그려짐)   기본 → 손인사 (main)
 *   깨어 있을 때 캐릭터 누름          손 흔들기 (hi)
 *   한동안 활동 없음                  손인사 → 졸음 (sleep)
 *   졸고 있을 때 누름                 졸음 → 놀람 (awake) — 놀란 뒤에는 눌러도 반응 없음
 *   놀란 뒤 다시 활동 없음            놀람 → 졸음 (sleep2)
 * 답을 못 찾음·오류 화면 → 우는 호빗 (sad, MascotOnce)
 *
 * - 같은 파일을 다시 틀 때(hi 두 번) 브라우저가 처음부터 다시 틀지 않아서, 한 번 받은 파일(blob)로 재생마다 새 주소를 만듦
 * - 움직이는 그림을 받기 전·'동작 줄이기'를 켠 학생에게는 원래 PNG
 * - 시작 화면이 여러 개 쌓여도(홈 버튼을 여러 번) 맨 아래(최근) 것만 졸고 깸
 */
export type Clip = 'main' | 'hi' | 'sleep' | 'awake' | 'sleep2' | 'sad';

import { chatApi } from '../../api/liveChat';

// 76장 × 67ms (만들 때 img2webp -d 67) — 5초로 끊으면 마지막 0.1초가 잘려 다음 클립으로 넘어갈 때 툭 끊겼음
const CLIP_MS = 76 * 67;

// 관리자 사이트 > 챗봇 설정 > 호빗 캐릭터 (움직이기 켜기·끄기, 졸기까지 시간) — /chat/features로 한 번 받음
const config = { enabled: true, idleMs: 30_000 };
let configP: Promise<void> | null = null;
const loadConfig = () =>
  (configP ??= chatApi
    .features()
    .then((f) => {
      if (f.mascot) {
        config.enabled = f.mascot.enabled !== false;
        if (Number.isFinite(f.mascot.idleSec)) config.idleMs = Math.max(10, f.mascot.idleSec) * 1000;
      }
    })
    .catch(() => undefined));

const blobs = new Map<Clip, Promise<Blob | null>>();
const loadClip = (clip: Clip): Promise<Blob | null> => {
  let p = blobs.get(clip);
  if (!p) {
    p = fetch(`/mascot/${clip}.webp`)
      .then((r) => (r.ok ? r.blob() : null))
      .catch(() => null);
    blobs.set(clip, p);
  }
  return p;
};
/** 미리 받기 + 그릴 준비(decode)까지 — 로딩 화면(App)·다음에 나올 클립 */
export const preloadClip = async (clip: Clip): Promise<void> => {
  if (reducedMotion()) return;
  const blob = await loadClip(clip);
  if (blob) await decodeBlob(blob).catch(() => undefined);
};
const decodeBlob = async (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
  } finally {
    URL.revokeObjectURL(url);
  }
};
const later = (fn: () => void) =>
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500);

const reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/** 클립 재생기 — play(clip)이 끝나면(5초) resolve. 받지 못하면 바로 resolve (그림은 그대로) */
const usePlayer = (poster: string) => {
  const [played, setSrc] = useState<string | null>(null);
  const src = played ?? poster; // 처음(그림을 받기 전)엔 PNG — PNG 주소가 늦게 정해져도 따라감
  const urlRef = useRef<string | null>(null);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );
  const play = useCallback(async (clip: Clip): Promise<boolean> => {
    await loadConfig();
    if (reducedMotion() || !config.enabled) return false;
    const blob = await loadClip(clip);
    if (!blob || !alive.current) return false;
    const url = URL.createObjectURL(blob);
    // 새 그림이 그릴 준비가 된 뒤에 바꿈 — 바로 바꾸면 준비되는 동안 잠깐 비거나 멈춰 보였음
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
    } catch {}
    if (!alive.current) return false;
    const prev = urlRef.current;
    urlRef.current = url;
    setSrc(url);
    if (prev) setTimeout(() => URL.revokeObjectURL(prev), 1000); // 새 그림이 그려진 뒤에
    await new Promise((r) => setTimeout(r, CLIP_MS));
    return alive.current;
  }, []);
  return { src, play };
};

let activeHome = 0; // 가장 최근에 그려진 시작 화면 호빗

export const HomeMascot: React.FC<{ poster: string; className?: string; label: string }> = ({ poster, className = '', label }) => {
  const { src, play } = usePlayer(poster);
  const id = useRef(0);
  const busy = useRef(true); // 재생 중에는 누름·졸음 무시
  const pose = useRef<'awake' | 'asleep'>('awake');
  const lastAwake = useRef<'main' | 'hi' | 'awake'>('main');
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  const run = useCallback(
    async (clip: Clip, next: 'awake' | 'asleep') => {
      busy.current = true;
      await play(clip);
      busy.current = false;
      pose.current = next;
    },
    [play]
  );

  const armIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(async () => {
      if (id.current !== activeHome || busy.current || pose.current !== 'awake' || document.hidden) return armIdle();
      const clip: Clip = lastAwake.current === 'awake' ? 'sleep2' : 'sleep';
      loadClip('awake'); // 깨울 때 바로 나오게 미리
      await run(clip, 'asleep');
    }, config.idleMs);
  }, [run]);

  useEffect(() => {
    id.current = ++activeHome;
    let stop = false;
    (async () => {
      await run('main', 'awake');
      if (stop) return;
      later(() => {
        loadClip('hi');
        loadClip('sleep');
        loadClip('sleep2');
      });
      armIdle();
    })();
    // 화면 어디서든 활동하면 졸음 시계를 다시 (깨어 있을 때만 — 자는 중에는 눌러야 깸)
    let lastAct = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastAct < 1000) return; // 마우스 움직임은 자주 와서 1초에 한 번만
      lastAct = now;
      if (pose.current === 'awake' && !busy.current) armIdle();
    };
    const evs = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;
    evs.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    // 휴대폰을 흔들면 깸 (안드로이드 — 아이폰은 움직임 권한을 물어야 해서 탭으로만)
    let last: { x: number; y: number; z: number } | null = null;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const cur = { x: a.x, y: a.y, z: a.z };
      if (last && Math.abs(cur.x - last.x) + Math.abs(cur.y - last.y) + Math.abs(cur.z - last.z) > 25) wakeRef.current();
      last = cur;
    };
    window.addEventListener('devicemotion', onMotion);
    return () => {
      stop = true;
      clearTimeout(idleTimer.current);
      evs.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener('devicemotion', onMotion);
    };
    // 처음 한 번만
  }, [run, armIdle]);

  // 졸고 있으면 깨움 (졸음 → 놀람) — PC는 마우스를 올리거나 누름, 휴대폰은 탭·흔들기
  const wake = useCallback(async () => {
    if (busy.current || pose.current !== 'asleep' || id.current !== activeHome) return false;
    lastAwake.current = 'awake';
    await run('awake', 'awake');
    armIdle();
    return true;
  }, [run, armIdle]);
  const wakeRef = useRef(wake);
  wakeRef.current = wake;

  const onClick = async () => {
    if (busy.current) return;
    if (pose.current === 'asleep') return wake();
    if (lastAwake.current === 'awake') return; // 놀란 뒤(awake)에는 눌러도 반응 없음 — 가만히 두면 다시 졺(sleep2)
    lastAwake.current = 'hi'; // 깨어 있을 때 누르면 손 흔들기
    await run('hi', 'awake');
    armIdle();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={(e) => e.pointerType === 'mouse' && wake()}
      aria-label={label}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-line"
    >
      <img src={src} alt="" width={400} height={400} className={className} loading="eager" draggable={false} />
    </button>
  );
};

/** 한 번만 재생 (예: 답을 못 찾음·오류 → sad) */
export const MascotOnce: React.FC<{ clip: Clip; poster: string; className?: string; alt?: string }> = ({ clip, poster, className = '', alt = '' }) => {
  const { src, play } = usePlayer(poster);
  useEffect(() => {
    play(clip);
  }, [clip, play]);
  return <img src={src} alt={alt} width={400} height={400} className={className} decoding="async" draggable={false} />;
};
