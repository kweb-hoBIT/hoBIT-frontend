/**
 * 화면 모드
 *   full   — hobit.kr: 지금처럼 전체 화면
 *   widget — 위젯용 서브도메인(REACT_APP_WIDGET_HOSTS): 오른쪽 아래 버튼 + 떠 있는 대화창
 *   embed  — 위젯 대화창 안의 iframe (?embed=1): 앱 자체는 full과 같고, 창 크기가 곧 화면 크기
 * 로컬 확인: ?mode=widget / ?mode=full
 */
export type AppMode = 'full' | 'widget' | 'embed';

export const getAppMode = (): AppMode => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') === '1') return 'embed';
  if (params.get('mode') === 'widget') return 'widget';
  if (params.get('mode') === 'full') return 'full';
  const widgetHosts = (process.env.REACT_APP_WIDGET_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return widgetHosts.includes(window.location.hostname.toLowerCase()) ? 'widget' : 'full';
};

