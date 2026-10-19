import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import WidgetShell from './widget/WidgetShell';
import { getAppMode } from './widget/mode';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 위젯 창 안(iframe)이면 표시 — 글자 크기 등 위젯 전용 스타일 (index.css html.embed)
if (getAppMode() === 'embed') document.documentElement.classList.add('embed');

const rootElement = document.getElementById('root');
const queryClient = new QueryClient();

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {/* 위젯용 서브도메인은 떠 있는 대화창, 그 외(hobit.kr·대화창 안 iframe)는 앱 그대로 */}
        {getAppMode() === 'widget' ? <WidgetShell /> : <App />}
      </QueryClientProvider>
    </React.StrictMode>
  );
}
