import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

export type RelatedNotice = { title: string; link: string; due_end_date: string; d_day: number; status: 'open' | 'upcoming' };

/**
 * 답변 아래 '관련 공지' — 질문 주제와 맞고 아직 신청할 수 있는 학부 공지·장학 (최대 2개, 서버가 고름).
 * 학생이 묻지 않아도 놓치기 쉬운 신청 기한을 알려줌. 주제가 맞는 공지가 없으면 아무것도 그리지 않음
 */
const RelatedNotices: React.FC<{ items: RelatedNotice[] }> = ({ items }) => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  if (!items.length) return null;
  const badge = (n: RelatedNotice) =>
    n.status === 'upcoming'
      ? isKorean ? '신청 예정' : 'Upcoming'
      : n.d_day === 0 ? (isKorean ? '오늘 마감' : 'Due today') : `D-${n.d_day}`;
  return (
    <div className="hobit-appear mt-[10px] w-0 min-w-full">
      <p className="text-f-caption text-ink-3">{isKorean ? '관련 공지' : 'Related notices'}</p>
      <ul className="mt-[4px] flex flex-col gap-[4px]">
        {items.map((n) => (
          <li key={n.link || n.title}>
            <a href={n.link} target="_blank" rel="noreferrer" className="flex items-start gap-[8px] text-f-sm text-ink-2 hover:text-ink">
              <span className={`shrink-0 rounded-full px-[8px] py-[1px] text-[12px] font-6semibold ${n.status === 'open' && n.d_day <= 2 ? 'bg-accent text-white' : 'bg-card text-ink-2'}`}>
                {badge(n)}
              </span>
              <span className="line-clamp-2">{n.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedNotices;
