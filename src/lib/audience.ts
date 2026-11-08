import { Faq } from '../types/faq';
import { Program } from '../redux/programSlice';

/**
 * 학부/대학원 스위치에 맞는 FAQ인지 — 관리자 FAQ의 '대상' 칸 (학부·대학원·공통)
 * 대상 칸이 없는 옛 데이터는 학부로 봄 (행정실 FAQ 대부분이 학부 행정팀 내용)
 */
export const faqFitsProgram = (faq: Pick<Faq, 'audience'>, program: Program) => {
  const a = faq.audience ?? 'undergraduate';
  return a === 'all' || a === program;
};
