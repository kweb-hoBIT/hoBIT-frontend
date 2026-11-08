import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * AI 답변 마크다운 — 따로 받는 코드 조각 (Response.tsx에서 lazy).
 * 플러그인·태그 모양은 한 번만 만들어 둠 (예전엔 그릴 때마다 새 객체였음)
 */
const REMARK_PLUGINS: NonNullable<React.ComponentProps<typeof ReactMarkdown>['remarkPlugins']> = [[remarkGfm, { singleTilde: false }]];

const COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-f-base font-7bold text-ink leading-snug">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-f-base font-7bold text-ink leading-snug">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-2 text-f-base font-7bold text-ink leading-snug">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-2">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  strong: ({ children }) => <strong className="font-7bold">{children}</strong>,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto rounded-[12px] border border-line bg-surface">
      <table className="min-w-full border-collapse text-f-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-card">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-line px-3 py-2 text-left font-7bold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line px-3 py-2 align-top text-ink">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-link hover:underline break-all"
    >
      {children}
    </a>
  ),
};

const Markdown: React.FC<{ text: string }> = ({ text }) => (
  <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
    {text}
  </ReactMarkdown>
);

export default Markdown;
