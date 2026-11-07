import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../redux/store';
import { ClosingNotice, getClosingNotices } from '../../api/query';

/**
 * 대화 시작 화면 '곧 마감되는 공지' — 학생들이 공지에 있는데도 몰라서 놓치는 신청 기한을 먼저 보여줌.
 * 7일 안에 마감되는 학부 공지·장학만, 프로필(학과·학년 등)이 있으면 대상이 맞는 것만. 없으면 카드를 그리지 않음
 */
const ClosingNotices: React.FC = () => {
  const isKorean = useSelector((state: RootState) => state.language.isKorean);
  const [items, setItems] = useState<ClosingNotice[]>([]);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    getClosingNotices().then((r) => {
      setItems(r.items);
      setPersonalized(r.personalized);
    });
  }, []);

  if (!items.length) return null;

  const dday = (d: number) => (d === 0 ? (isKorean ? '오늘 마감' : 'Due today') : `D-${d}`);

  return (
    <div className="bg-card w-full max-w-[330px] md:max-w-none md:w-[350px] mt-[12px] rounded-[20px] p-[16px]">
      <p className="text-ink font-6semibold text-f-base">
        {isKorean
          ? personalized ? '내 조건에 맞는 곧 마감되는 공지' : '곧 마감되는 공지'
          : personalized ? 'Closing soon for you' : 'Closing soon'}
      </p>
      <ul className="mt-[8px] flex flex-col gap-[6px]">
        {items.map((n) => (
          <li key={n.link || n.title}>
            <a
              href={n.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-[8px] text-f-sm text-ink-2 hover:text-ink"
            >
              <span className={`shrink-0 rounded-full px-[8px] py-[1px] text-[12px] font-6semibold ${n.d_day <= 2 ? 'bg-accent text-white' : 'bg-surface text-ink-2'}`}>
                {dday(n.d_day)}
              </span>
              <span className="line-clamp-2">{n.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClosingNotices;
