import React, { useEffect } from 'react';

/**
 * 위젯 모드(위젯용 서브도메인) — 버튼·창은 public/embed.js가 그림.
 * 다른 사이트(정보대학 홈페이지 등)에 붙일 때와 같은 스크립트를 써서 동작을 한 곳에서만 관리.
 * 우리 서브도메인에서는 처음부터 창을 연 상태로 시작.
 */
const WidgetShell: React.FC = () => {
  useEffect(() => {
    if (document.querySelector('script[data-hobit-embed]')) return;
    const s = document.createElement('script');
    s.src = `${window.location.origin}/embed.js`;
    s.dataset.hobitEmbed = '1';
    s.dataset.open = 'true';
    s.dataset.origin = window.location.origin;
    document.body.appendChild(s);
  }, []);

  return <div className="min-h-[100dvh] bg-page" />;
};

export default WidgetShell;
