import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Socket } from 'socket.io-client';
import { RootState } from '../../redux/store';
import { openLiveChat, closeLiveChat } from '../../redux/liveChatSlice';
import { appConfirm } from '../ui/Dialog';
import {
  chatApi,
  ChatApiError,
  ChatMessage,
  ChatMode,
  ChatSession,
  ChatStatus,
  clearToken,
  connectChat,
  EDIT_WINDOW_MS,
  fileUrl,
  getToken,
} from '../../api/liveChat';
import { getRecentExchanges } from '../../lib/recentChat';
import { IoChatbubbles } from 'react-icons/io5';
import { closeMenu } from '../../redux/menuSlice';

/**
 * 실시간 채팅 창 (학생)
 *  상태 확인 → (운영시간 밖: 메일 인증 → 이메일 작성 / 선배 자리비움) → 동의·학교 메일 인증 → 채팅 요청 → 대기 → 대화 → 종료·만족도
 *  새로고침해도 진행 중인 채팅에 다시 붙음 (토큰·채팅은 서버에 있음)
 */
type Step = 'loading' | 'away' | 'closed' | 'verify' | 'ready' | 'chat' | 'switch' | 'error';

const T = {
  ko: {
    staff: '행정실 채팅',
    senior: '선배 채팅',
    close: '닫기',
    loading: '확인하고 있어요…',
    awayTitle: '지금은 채팅할 수 있는 선배가 없어요',
    awayBody: '근로장학생 선배가 채팅 가능 상태일 때 연결돼요. 잠시 후 다시 시도하거나, 행정실 채팅을 이용해 주세요.',
    offlineTitle: '지금은 행정실 채팅 운영 시간이 아니에요',
    hours: (s: ChatStatus): string =>
      s.hours?.today
        ? `오늘 운영 시간: ${s.hours.today.start}–${s.hours.today.end}${s.hours.lunch ? ` (점심 ${s.hours.lunch.start}–${s.hours.lunch.end} 제외)` : ''}`
        : '오늘은 휴무일이에요. 평일 학기 중 09:00–17:30, 방학 중 10:00–17:00에 채팅할 수 있어요.',
    offlineBody: '아래로 문의를 남겨 주시면 행정실에서 확인 후 답변드려요.',
    contactEmail: '이메일',
    contactPhone: '전화',
    contactPlace: '위치',
    place: '우정정보관 102호 (정보대학 행정실)',
    longWaitBody: '연결이 늦어지면 아래로 문의해 주셔도 돼요.',
    consentTitle: '개인정보 수집·이용 동의',
    consent:
      '채팅을 위해 학교 메일 주소, 채팅 시작 때 입력하는 학생 정보(과정·이름·학번·학과·학적 상태), 채팅 내용, 첨부 파일, 최근 호빗 대화를 수집해요. 채팅 기록은 1년, 첨부 파일은 90일 보관한 뒤 자동으로 삭제돼요. 선배 채팅에서는 이름·학번이 선배에게 보이지 않아요.',
    agree: '위 내용에 동의해요',
    email: '학교 메일',
    emailHint: '고려대학교 메일(@korea.ac.kr)로만 인증할 수 있어요',
    emailId: '메일 아이디',
    sendCode: '인증 코드 받기',
    devStart: '바로 시작 (개발 모드 · 메일 인증 생략)',
    resend: (s: number): string => (s > 0 ? `다시 받기 (${s}초)` : '코드 다시 받기'),
    code: '인증 코드 6자리',
    verify: '인증하기',
    editEmail: '메일 주소 수정',
    showOriginal: '자동 번역됨 · 원문 보기',
    msgRemoved: '삭제된 메시지예요',
    msgEdited: '수정됨',
    msgMenu: '메시지 메뉴',
    msgEdit: '수정',
    msgRemove: '삭제',
    msgRemoveConfirm: '이 메시지를 삭제할까요? 상대방 화면에서도 사라지고 되돌릴 수 없어요.',
    editing: '메시지 수정 중',
    editCancel: '취소',
    editSave: '수정',
    showTranslation: '번역 보기',
    sentTo: (e: string): string => `${e}로 인증 코드를 보냈어요. 메일함(스팸함 포함)을 확인해 주세요.`,
    readyTitle: (m: ChatMode): string => (m === 'senior' ? '선배에게 연결할게요' : '행정실에 연결할게요'),
    switchTitle: (cur: ChatMode): string => `진행 중인 ${cur === 'senior' ? '선배 채팅' : '행정실 채팅'}이 있어요`,
    switchBody: (cur: ChatMode, next: ChatMode): string =>
      `채팅은 한 번에 하나만 할 수 있어요. ${next === 'senior' ? '선배 채팅' : '행정실 채팅'}을 시작하면 지금 ${cur === 'senior' ? '선배 채팅' : '행정실 채팅'}은 종료돼요.`,
    switchBack: (cur: ChatMode): string => `${cur === 'senior' ? '선배 채팅' : '행정실 채팅'}으로 돌아가기`,
    switchGo: (next: ChatMode): string => `종료하고 ${next === 'senior' ? '선배 채팅' : '행정실 채팅'} 시작`,
    readyBody: '아래 정보와 최근 호빗 대화가 함께 전달돼 같은 설명을 반복하지 않아도 돼요.',
    info: {
      title: '학생 정보',
      allRequired: '모두 입력해 주세요',
      program: '과정',
      undergrad: '학부',
      grad: '대학원',
      name: '이름',
      namePh: '이름 입력',
      studentId: '학번',
      studentIdPh: '예: 2024320000',
      department: '학과',
      departmentPh: '예: 컴퓨터학과',
      status: '학적 상태',
      statuses: ['재학', '휴학', '수료', '졸업유예', '졸업', '기타'],
      edit: '수정',
      mine: '내 정보',
      seniorNote: '선배에게는 이름·학번이 보이지 않아요.',
      required: '필수 항목을 입력해 주세요.',
      badId: '학번은 숫자로 입력해 주세요.',
    },
    start: '채팅 요청하기',
    waiting: (n: number): string => (n > 0 ? `대기 중 · 앞에 ${n}명` : '대기 중'),
    longWait: '연결이 오래 걸리나요?',
    toMail: '이메일로 문의하기',
    active: (): string => '채팅 중',
    closed: '채팅이 종료되었어요',
    typing: '입력 중…',
    placeholder: '메시지를 입력하세요',
    send: '보내기',
    attach: '파일 첨부 (사진·PDF, 10MB)',
    end: '채팅 종료',
    endConfirm: '채팅을 종료할까요?',
    rateTitle: '채팅은 어떠셨나요?',
    rateComment: '남기고 싶은 말 (선택)',
    rateSend: '평가 보내기',
    rated: '평가해 주셔서 고마워요!',
    endedBeforeConnect: '연결되기 전에 채팅이 종료되었어요.',
    newChat: '새 채팅 시작',
    subject: '제목',
    body: '문의 내용',
    mailReply: (e: string): string => `답장은 ${e}로 와요`,
    mailSend: '메일 보내기',
    mailSent: '메일을 보냈어요. 행정실에서 학교 메일로 답장할 거예요.',
    fileExpired: '보관 기간이 지나 삭제된 파일이에요',
    errors: {
      moderated: '욕설이나 예의에 어긋나는 표현이 있어 보내지 않았어요. 정중하게 다시 보내 주세요.',
      edit_expired: '보낸 지 5분이 지나 고치거나 지울 수 없어요.',
      not_editable: '파일은 고칠 수 없어요. 지우고 다시 보내 주세요.',
      removed: '이미 지운 메시지예요.',
      rate_limited: '너무 빠르게 보내고 있어요. 잠시 후 다시 보내 주세요.',
      too_long: '메시지가 너무 길어요 (2,000자까지).',
      closed: '이미 종료된 채팅이에요.',
      upload: '파일을 올리지 못했어요. 사진(JPG·PNG·WEBP·GIF)이나 PDF, 10MB까지만 보낼 수 있어요.',
      generic: '문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
    } as Record<string, string>,
    retry: '다시 시도',
  },
  en: {
    staff: 'Office chat',
    senior: 'Chat with a senior',
    close: 'Close',
    loading: 'Checking…',
    awayTitle: 'No senior is available right now',
    awayBody: 'You will be connected when a student assistant is available. Please try again later or use the office chat.',
    offlineTitle: 'The office chat is closed now',
    hours: (s: ChatStatus): string =>
      s.hours?.today
        ? `Today: ${s.hours.today.start}–${s.hours.today.end}${s.hours.lunch ? ` (except lunch ${s.hours.lunch.start}–${s.hours.lunch.end})` : ''}`
        : 'Closed today. Weekdays 09:00–17:30 during the semester, 10:00–17:00 during breaks.',
    offlineBody: 'Please contact the office below and they will get back to you.',
    contactEmail: 'Email',
    contactPhone: 'Phone',
    contactPlace: 'Office',
    place: 'Woojung Hall 102 (College of Informatics office)',
    longWaitBody: 'If it takes too long, you can also contact the office:',
    consentTitle: 'Consent to collect personal information',
    consent:
      'For this chat we collect your school email, the student details you enter (program, name, student ID, department, status), messages, attachments and your recent hoBIT conversation. Chats are kept for 1 year and files for 90 days, then deleted automatically. In senior chats, your name and student ID are not shown to the senior.',
    agree: 'I agree',
    email: 'School email',
    emailHint: 'Only Korea University (@korea.ac.kr) email can be verified',
    emailId: 'email ID',
    sendCode: 'Send code',
    devStart: 'Start (dev mode · no email code)',
    resend: (s: number): string => (s > 0 ? `Resend (${s}s)` : 'Resend code'),
    code: '6-digit code',
    verify: 'Verify',
    editEmail: 'Change email',
    showOriginal: 'Auto-translated · Show original',
    msgRemoved: 'This message was deleted',
    msgEdited: 'edited',
    msgMenu: 'Message menu',
    msgEdit: 'Edit',
    msgRemove: 'Delete',
    msgRemoveConfirm: 'Delete this message? It will also disappear for the other person and can’t be undone.',
    editing: 'Editing message',
    editCancel: 'Cancel',
    editSave: 'Save',
    showTranslation: 'Show translation',
    sentTo: (e: string): string => `We sent a code to ${e}. Check your inbox (and spam).`,
    readyTitle: (m: ChatMode): string => (m === 'senior' ? 'Connect to a senior' : 'Connect to the office'),
    switchTitle: (cur: ChatMode): string => `You already have an open ${cur === 'senior' ? 'chat with a senior' : 'office chat'}`,
    switchBody: (cur: ChatMode, next: ChatMode): string =>
      `You can have one chat at a time. Starting a ${next === 'senior' ? 'chat with a senior' : 'office chat'} will end your current ${cur === 'senior' ? 'chat with a senior' : 'office chat'}.`,
    switchBack: (cur: ChatMode): string => `Back to ${cur === 'senior' ? 'chat with a senior' : 'office chat'}`,
    switchGo: (next: ChatMode): string => `End it and start ${next === 'senior' ? 'chat with a senior' : 'office chat'}`,
    readyBody: 'The details below and your recent hoBIT conversation are shared so you don’t have to repeat yourself.',
    info: {
      title: 'Your details',
      allRequired: 'All fields required',
      program: 'Program',
      undergrad: 'Undergraduate',
      grad: 'Graduate',
      name: 'Name',
      namePh: 'Your name',
      studentId: 'Student ID',
      studentIdPh: 'e.g. 2024320000',
      department: 'Department',
      departmentPh: 'e.g. Computer Science',
      status: 'Status',
      statuses: ['Enrolled', 'On leave', 'Completed coursework', 'Graduation deferred', 'Graduated', 'Other'],
      edit: 'Edit',
      mine: 'My details',
      seniorNote: 'Your name and student ID are not shown to the senior.',
      required: 'Please fill in the required fields.',
      badId: 'Student ID must be numbers only.',
    },
    start: 'Request chat',
    waiting: (n: number): string => (n > 0 ? `Waiting · ${n} ahead of you` : 'Waiting'),
    longWait: 'Taking too long?',
    toMail: 'Send an email instead',
    active: (): string => 'In chat',
    closed: 'This chat has ended',
    typing: 'typing…',
    placeholder: 'Type a message',
    send: 'Send',
    attach: 'Attach (image·PDF, 10MB)',
    end: 'End chat',
    endConfirm: 'End this chat?',
    rateTitle: 'How was the chat?',
    rateComment: 'Comment (optional)',
    rateSend: 'Send rating',
    rated: 'Thanks for your feedback!',
    endedBeforeConnect: 'The chat ended before a staff member joined.',
    newChat: 'New chat',
    subject: 'Subject',
    body: 'Your question',
    mailReply: (e: string): string => `Replies go to ${e}`,
    mailSend: 'Send email',
    mailSent: 'Email sent. The office will reply to your school email.',
    fileExpired: 'This file was deleted after the retention period',
    errors: {
      moderated: 'Your message was not sent because it contains rude or inappropriate language. Please rephrase it politely.',
      edit_expired: 'Messages can only be edited or deleted within 5 minutes.',
      not_editable: 'Files can’t be edited. Delete it and send again.',
      removed: 'This message was already deleted.',
      rate_limited: 'You are sending too fast. Please wait a moment.',
      too_long: 'Message too long (max 2,000 characters).',
      closed: 'This chat has already ended.',
      upload: 'Upload failed. Images (JPG·PNG·WEBP·GIF) or PDF up to 10MB only.',
      generic: 'Something went wrong. Please try again.',
    } as Record<string, string>,
    retry: 'Retry',
  },
};

const LONG_WAIT_MS = 10 * 60 * 1000;

// 채팅 창 너비 (데스크톱) — 이 기기에 기억
const WIDTH_KEY = 'hobit-livechat-width';
const DEFAULT_W = 440;
const MIN_W = 360;
/** 최대 너비: 상단 가운데 제목("정보대학(학부) 챗봇 호빗")을 가리지 않는 데까지 */
const maxWidth = () => {
  const title = document.querySelector('[data-hobit-title]');
  const text = title ? Array.from(title.children).find((el) => (el as HTMLElement).offsetParent !== null) ?? title : null;
  const titleRight = text ? text.getBoundingClientRect().right : window.innerWidth * 0.6;
  return Math.max(MIN_W, Math.min(960, Math.floor(window.innerWidth - titleRight - 24)));
};

const formatSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`);
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

// ── 학교 메일 인증 ─────────────────────────────────────────
const Verify: React.FC<{ t: typeof T.ko; onDone: () => void; skipCode: boolean }> = ({ t, onDone, skipCode }) => {
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const fullEmail = `${email.trim()}@korea.ac.kr`;

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      if (skipCode) {
        // 개발 모드: 코드 없이 바로 (서버가 허용할 때만)
        await chatApi.devLogin(fullEmail);
        return onDone();
      }
      await chatApi.sendCode(fullEmail);
      setSentTo(fullEmail.toLowerCase());
      setCooldown(60);
    } catch (e) {
      setError(e instanceof ChatApiError && e.message ? e.message : t.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!sentTo) return;
    setBusy(true);
    setError(null);
    try {
      await chatApi.verify(sentTo, code);
      onDone();
    } catch (e) {
      setError(e instanceof ChatApiError && e.message ? e.message : t.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-[12px] p-[20px]">
      <section className="rounded-[16px] bg-card p-[14px]">
        <p className="font-6semibold text-f-base text-ink">{t.consentTitle}</p>
        <p className="mt-[6px] text-f-sm text-ink-2 leading-relaxed">{t.consent}</p>
        <label className="mt-[10px] flex items-center gap-[8px] text-f-base text-ink cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-[18px] w-[18px] accent-[rgb(var(--c-accent))]" />
          {t.agree}
        </label>
      </section>

      <p className="text-f-base font-6semibold text-ink">{t.email}</p>
      {/* 입력 묶음: 아이디는 왼쪽부터, 오른쪽 칸에 고정된 학교 도메인(진한 글자) — 주소의 일부로 읽히게 */}
      <label className="flex cursor-text items-stretch overflow-hidden rounded-[14px] border border-line bg-surface focus-within:border-accent-ink">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value.replace(/@.*$/, '').trim())}
          placeholder={t.emailId}
          inputMode="email"
          autoComplete="username"
          disabled={!agreed || !!sentTo}
          className="min-w-0 flex-1 bg-transparent px-[14px] py-[10px] text-f-base text-ink outline-none disabled:opacity-60"
        />
        <span className="flex items-center border-l border-line bg-card px-[14px] text-f-base font-5medium text-ink">@korea.ac.kr</span>
      </label>
      <p className="-mt-[6px] text-f-sm text-ink-3">{t.emailHint}</p>

      {!sentTo ? (
        <button
          type="button"
          disabled={!agreed || !email.trim() || busy}
          onClick={send}
          className="rounded-full bg-accent py-[10px] text-f-base font-6semibold text-white disabled:opacity-50"
        >
          {skipCode ? t.devStart : t.sendCode}
        </button>
      ) : (
        <>
          <div className="rounded-[14px] bg-card px-[12px] py-[10px]">
            <p className="text-f-base text-ink-2">{t.sentTo(sentTo)}</p>
            <div className="mt-[6px] flex flex-wrap gap-x-[14px] gap-y-[4px] text-f-sm">
              <button type="button" disabled={cooldown > 0 || busy} onClick={send} className="font-6semibold text-accent-ink underline disabled:no-underline disabled:text-ink-3">
                {t.resend(cooldown)}
              </button>
              <button
                type="button"
                onClick={() => {
                  // 메일을 잘못 썼을 때 — 다시 입력
                  setSentTo(null);
                  setCode('');
                  setError(null);
                }}
                className="font-6semibold text-ink-2 underline"
              >
                {t.editEmail}
              </button>
            </div>
          </div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            className="rounded-[14px] border border-line bg-surface px-[12px] py-[8px] text-center text-f-xl tracking-[0.4em] text-ink outline-none focus:border-accent-ink placeholder:text-f-sm placeholder:tracking-normal"
          />
          <button
            type="button"
            disabled={code.length !== 6 || busy}
            onClick={verify}
            className="rounded-full bg-accent py-[10px] text-f-base font-6semibold text-white disabled:opacity-50"
          >
            {t.verify}
          </button>
          <button type="button" disabled={cooldown > 0 || busy} onClick={send} className="text-f-sm text-ink-2 underline disabled:no-underline disabled:opacity-60">
            {t.resend(cooldown)}
          </button>
        </>
      )}
      {error && <p className="rounded-[12px] bg-[rgb(var(--c-senior))] px-[12px] py-[8px] text-f-sm text-accent-ink">{error}</p>}
    </div>
  );
};

// ── 문의처 안내 (운영시간 밖·오래 기다릴 때) ─────────────────
/** 채팅 시작 때 입력하는 학생 정보 — 이 기기에 기억 (다음엔 확인만) */
export type StudentInfo = { program: 'undergrad' | 'grad' | ''; name: string; student_id: string; department: string; student_status: string };
const INFO_KEY = 'hobit-livechat-student-info';
const EMPTY_INFO: StudentInfo = { program: '', name: '', student_id: '', department: '', student_status: '' };
const loadInfo = (): StudentInfo => {
  try {
    return { ...EMPTY_INFO, ...JSON.parse(localStorage.getItem(INFO_KEY) || '{}') };
  } catch {
    return EMPTY_INFO;
  }
};
const saveInfo = (v: StudentInfo) => {
  try {
    localStorage.setItem(INFO_KEY, JSON.stringify(v));
  } catch {
    /* 저장 못 해도 이번 채팅은 진행 */
  }
};
/** 빠진 칸 목록 (없으면 통과) */
const infoProblems = (v: StudentInfo): (keyof StudentInfo)[] =>
  (Object.keys(EMPTY_INFO) as (keyof StudentInfo)[]).filter((k) => !String(v[k]).trim() || (k === 'student_id' && !/^\d{4,12}$/.test(v.student_id.trim())));

const DANGER = '#e5484d'; // 오류 표시 (이 화면 색 체계에 빨강이 없어 직접)

/** 한 줄 요약: 학부 · 김호빗 · 2024320001 · 컴퓨터학과 · 재학 (학적 상태는 화면 언어로) */
const infoParts = (t: typeof T.ko, p: Partial<Record<keyof StudentInfo, string>>): string[] => {
  const statusIdx = T.ko.info.statuses.indexOf(p.student_status ?? '');
  return [
    p.program === 'undergrad' ? t.info.undergrad : p.program === 'grad' ? t.info.grad : '',
    p.name,
    p.student_id,
    p.department,
    statusIdx >= 0 ? t.info.statuses[statusIdx] : p.student_status,
  ].filter((x): x is string => !!x);
};

const StudentInfoForm: React.FC<{ t: typeof T.ko; mode: ChatMode; value: StudentInfo; onChange: (v: StudentInfo) => void; bad: (keyof StudentInfo)[] }> = ({
  t,
  mode,
  value,
  onChange,
  bad,
}) => {
  const set = (k: keyof StudentInfo, v: string) => onChange({ ...value, [k]: v });
  const err = (k: keyof StudentInfo) => bad.includes(k);
  const input = (k: keyof StudentInfo) =>
    `h-[42px] w-full rounded-[10px] border bg-surface px-[12px] text-f-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-ink ${
      err(k) ? '' : 'border-line'
    }`;
  const errStyle = (k: keyof StudentInfo) => (err(k) ? { borderColor: DANGER } : undefined);
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="mb-[6px] block text-f-xs font-6semibold text-ink-2">{children}</span>
  );

  return (
    <div className="flex flex-col gap-[14px]">
      {/* 과정 — 선택된 쪽이 흰 알약으로 */}
      <div>
        <Label>{t.info.program}</Label>
        <div
          role="radiogroup"
          aria-label={t.info.program}
          className="grid grid-cols-2 gap-[4px] rounded-[12px] bg-card p-[4px]"
          style={err('program') ? { boxShadow: `inset 0 0 0 1px ${DANGER}` } : undefined}
        >
          {(['undergrad', 'grad'] as const).map((p) => {
            const on = value.program === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set('program', p)}
                className={`h-[36px] rounded-[9px] text-f-sm transition-all ${
                  on ? 'bg-surface font-6semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'font-5medium text-ink-3 hover:text-ink-2'
                }`}
              >
                {p === 'undergrad' ? t.info.undergrad : t.info.grad}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <label className="min-w-0">
          <Label>{t.info.name}</Label>
          <input value={value.name} onChange={(e) => set('name', e.target.value.slice(0, 40))} placeholder={t.info.namePh} autoComplete="name" className={input('name')} style={errStyle('name')} />
        </label>
        <label className="min-w-0">
          <Label>{t.info.studentId}</Label>
          <input
            value={value.student_id}
            onChange={(e) => set('student_id', e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder={t.info.studentIdPh}
            inputMode="numeric"
            className={`${input('student_id')} tabular-nums`}
            style={errStyle('student_id')}
          />
        </label>
      </div>

      <label>
        <Label>{t.info.department}</Label>
        <input value={value.department} onChange={(e) => set('department', e.target.value.slice(0, 40))} placeholder={t.info.departmentPh} className={input('department')} style={errStyle('department')} />
      </label>

      {/* 학적 상태 — 고르기 쉬운 칩 (기본 선택 상자 대신) */}
      <div>
        <Label>{t.info.status}</Label>
        <div role="radiogroup" aria-label={t.info.status} className="flex flex-wrap gap-[6px]">
          {t.info.statuses.map((label, i) => {
            const v = T.ko.info.statuses[i]; // 저장은 항상 한국어 (담당자 화면용)
            const on = value.student_status === v;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set('student_status', v)}
                className={`h-[32px] rounded-full border px-[12px] text-f-xs transition-colors ${
                  on ? 'border-accent-ink bg-accent-ink font-6semibold text-on-accent-ink' : 'border-line bg-surface font-5medium text-ink-2 hover:border-ink-3'
                }`}
                style={!on && err('student_status') ? { borderColor: DANGER } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'senior' && <p className="text-f-xs leading-relaxed text-ink-3">{t.info.seniorNote}</p>}
    </div>
  );
};

const OFFICE_PHONE = '02-3290-4132~4';
const ContactInfo: React.FC<{ t: typeof T.ko; email: string }> = ({ t, email }) => (
  <ul className="mt-[10px] flex flex-col gap-[4px] text-f-sm">
    <li className="flex items-center gap-[8px]">
      <span className="w-[48px] shrink-0 text-f-xs text-ink-3">{t.contactEmail}</span>
      <a href={`mailto:${email}`} className="font-6semibold text-accent-ink underline">
        {email}
      </a>
    </li>
    <li className="flex items-center gap-[8px]">
      <span className="w-[48px] shrink-0 text-f-xs text-ink-3">{t.contactPhone}</span>
      <a href="tel:0232904132" className="font-6semibold text-ink">
        {OFFICE_PHONE}
      </a>
    </li>
    <li className="flex items-center gap-[8px]">
      <span className="w-[48px] shrink-0 text-f-xs text-ink-3">{t.contactPlace}</span>
      <span className="text-ink">{t.place}</span>
    </li>
  </ul>
);

// ── 메시지 하나 ───────────────────────────────────────────
/** 서버의 안내 문구(한국어)를 학생 화면 말로 — 학생 입장에서 "학생이 종료했어요"는 어색해서 */
const SYSTEM_TEXT: Record<string, { ko: string; en: string }> = {
  '행정실 담당자가 연결되었어요.': { ko: '행정실 담당자가 연결되었어요.', en: 'An office staff member joined the chat.' },
  '선배가 연결되었어요.': { ko: '선배가 연결되었어요.', en: 'A senior joined the chat.' },
  '학생이 채팅을 종료했어요.': { ko: '채팅을 종료했어요.', en: 'You ended the chat.' },
  '채팅이 종료되었어요.': { ko: '채팅이 종료되었어요.', en: 'The chat has ended.' },
};
// 용어를 "상담"→"채팅"으로 바꾸기 전에 저장된 안내도 같은 말로
const LEGACY_SYSTEM: Record<string, string> = {
  '학생이 상담을 종료했어요.': '학생이 채팅을 종료했어요.',
  '상담이 종료되었어요.': '채팅이 종료되었어요.',
};
const systemText = (t: typeof T.ko, raw: string) => {
  const body = LEGACY_SYSTEM[raw] ?? (/ 상담원이 연결되었어요\.$/.test(raw) ? '행정실 담당자가 연결되었어요.' : raw);
  const hit = SYSTEM_TEXT[body];
  if (!hit) return body;
  return t === T.ko ? hit.ko : hit.en;
};

/** 내 말풍선 옆 ⋯ — 수정(글만)·삭제 (보낸 뒤 5분 안) */
const MessageMenu: React.FC<{ t: typeof T.ko; canEdit: boolean; onEdit: () => void; onRemove: () => void }> = ({ t, canEdit, onEdit, onRemove }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0 self-center">
      <button
        type="button"
        aria-label={t.msgMenu}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-ink-3 transition-opacity hover:bg-card hover:text-ink-2 ${
          open ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full right-0 z-10 mb-[4px] min-w-[96px] overflow-hidden rounded-[12px] border border-line bg-surface py-[4px] shadow-lg">
          {canEdit && (
            <button type="button" role="menuitem" onClick={() => (setOpen(false), onEdit())} className="block w-full px-[12px] py-[6px] text-left text-f-xs font-6semibold text-ink hover:bg-card">
              {t.msgEdit}
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onRemove())} className="block w-full px-[12px] py-[6px] text-left text-f-xs font-6semibold text-[#e5484d] hover:bg-card">
            {t.msgRemove}
          </button>
        </div>
      )}
    </div>
  );
};

const Bubble: React.FC<{ m: ChatMessage; t: typeof T.ko; canModify?: boolean; onEdit?: () => void; onRemove?: () => void }> = ({
  m,
  t,
  canModify,
  onEdit,
  onRemove,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  if (m.sender === 'system') {
    return <p className="my-[6px] text-center text-f-xs text-ink-3">{systemText(t, m.body)}</p>;
  }
  const mine = m.sender === 'student';
  if (m.removed) {
    // 지운 메시지 — 자리만 남김
    return (
      <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} my-[8px]`}>
        <div className={`flex items-end gap-[6px] ${mine ? 'flex-row-reverse' : ''}`}>
          <span className="rounded-[18px] border border-dashed border-line px-[13px] py-[7px] text-f-xs italic text-ink-3">{t.msgRemoved}</span>
          <span className="shrink-0 text-[calc(var(--fs-scale,1)*11px)] text-ink-3">{timeOf(m.createdAt)}</span>
        </div>
      </div>
    );
  }
  const openFile = async () => {
    if (!m.attachment) return;
    try {
      const { url } = await chatApi.fileLink(m.attachment.id); // 링크는 10분짜리라 열 때 새로 받음
      window.open(fileUrl(url), '_blank', 'noopener,noreferrer');
    } catch {
      /* 삭제됨 */
    }
  };
  return (
    <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} my-[8px]`}>
      <div className={`group flex w-full items-end gap-[6px] ${mine ? 'flex-row-reverse' : ''}`}>
        {m.attachment ? (
          // 첨부는 말풍선 없이 — 사진은 사진만, PDF는 흰 파일 카드 (이름·크기를 봐야 무슨 파일인지 알 수 있어서)
          !m.attachment.url ? (
            <span className="rounded-[14px] border border-line bg-surface px-[12px] py-[8px] text-f-xs text-ink-3">{t.fileExpired}</span>
          ) : m.attachment.mime.startsWith('image/') ? (
            <button type="button" onClick={openFile} className="block max-w-[70%] overflow-hidden rounded-[16px] border border-line" aria-label={m.attachment.name}>
              <img
                src={fileUrl(m.attachment.url)}
                alt={m.attachment.name}
                className="block max-h-[calc(var(--fs-scale,1)*260px)] w-auto max-w-full object-cover"
                style={m.attachment.width && m.attachment.height ? { aspectRatio: `${m.attachment.width}/${m.attachment.height}` } : undefined}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={openFile}
              className="flex max-w-[78%] items-center gap-[10px] rounded-[14px] border border-line bg-surface px-[12px] py-[10px] text-left hover:bg-card"
            >
              <span className="flex h-[36px] w-[30px] shrink-0 items-end justify-center rounded-[6px] bg-[#e5484d] pb-[4px] text-[calc(var(--fs-scale,1)*9px)] font-7bold text-white">PDF</span>
              <span className="min-w-0">
                <span className="block truncate text-f-sm font-6semibold text-ink">{m.attachment.name}</span>
                <span className="text-f-xs text-ink-3">PDF · {formatSize(m.attachment.size)}</span>
              </span>
            </button>
          )
        ) : (
          <div
            className={`max-w-[78%] whitespace-pre-wrap break-words rounded-[18px] px-[13px] py-[8px] text-f-sm leading-[1.5] ${
              mine ? 'bg-accent-ink text-on-accent-ink rounded-br-[6px]' : 'bg-card text-ink rounded-bl-[6px]'
            }`}
          >
            {m.translation && !mine && !showOriginal ? m.translation.text : m.body}
          </div>
        )}
        <span className="shrink-0 text-[calc(var(--fs-scale,1)*11px)] text-ink-3">
          {m.editedAt && `${t.msgEdited} · `}
          {timeOf(m.createdAt)}
        </span>
        {mine && canModify && onRemove && <MessageMenu t={t} canEdit={!m.attachment && !!onEdit} onEdit={onEdit ?? (() => undefined)} onRemove={onRemove} />}
      </div>
      {m.translation && !mine && (
        <button type="button" onClick={() => setShowOriginal((v) => !v)} className="mt-[2px] ml-[4px] text-[calc(var(--fs-scale,1)*11px)] text-ink-3 underline">
          {showOriginal ? t.showTranslation : t.showOriginal}
        </button>
      )}
    </div>
  );
};

// ── 채팅방 ────────────────────────────────────────────────
const ChatRoom: React.FC<{
  t: typeof T.ko;
  initial: { session: ChatSession; messages: ChatMessage[]; position: number };
  officeEmail: string;
  onNew: () => void;
}> = ({ t, initial, officeEmail, onNew }) => {
  const [session, setSession] = useState(initial.session);
  const [messages, setMessages] = useState(initial.messages);
  const [position, setPosition] = useState(initial.position);
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(initial.session.rating !== null);
  const [longWait, setLongWait] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<ChatMessage | null>(null); // 고치는 중인 내 메시지
  const [now, setNow] = useState(Date.now()); // 5분 지나면 ⋯ 메뉴가 사라지게
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<number | null>(null);
  const lastTypingSent = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 입력칸 높이: 줄 수에 맞춰 늘어남 (Shift+Enter 줄바꿈, 최대 5줄 — 넘으면 안에서 스크롤)
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const line = parseFloat(getComputedStyle(ta).lineHeight) || 20;
    const pad = parseFloat(getComputedStyle(ta).paddingTop) + parseFloat(getComputedStyle(ta).paddingBottom);
    ta.style.height = `${Math.min(ta.scrollHeight, line * 5 + pad)}px`;
  }, [text]);

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const s = connectChat(token.token);
    socketRef.current = s;
    s.on('connect', () => {
      // 다시 연결될 때마다 놓친 메시지까지 받음
      s.emit('session:join', { sessionId: initial.session.id }, (r: any) => {
        if (r?.ok) {
          setSession(r.session);
          setMessages(r.messages);
          setPosition(r.position ?? 0);
        }
      });
    });
    s.on('message', (m: ChatMessage) => m.sessionId === initial.session.id && addMessage(m));
    s.on('session:update', (u: ChatSession) => u.id === initial.session.id && setSession(u));
    // 고치거나 지운 메시지 (나·상대 모두)
    s.on('message:updated', (m: ChatMessage) => {
      if (m.sessionId !== initial.session.id) return;
      setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
    });
    // 자동 번역이 늦게 도착 — 그 메시지에 덧붙임
    s.on('message:translated', (p: { id: number; sessionId: string; translation: ChatMessage['translation'] }) => {
      if (p.sessionId !== initial.session.id) return;
      setMessages((prev) => prev.map((x) => (x.id === p.id ? { ...x, translation: p.translation } : x)));
    });
    s.on('queue:position', (p: { sessionId: string; position: number }) => p.sessionId === initial.session.id && setPosition(p.position));
    s.on('typing', (p: { sessionId: string; from: string }) => {
      if (p.sessionId !== initial.session.id || p.from !== 'agent') return;
      setAgentTyping(true);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => setAgentTyping(false), 3000);
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [initial.session.id, addMessage]);

  // 오래 기다리면 이메일 안내
  useEffect(() => {
    if (session.status !== 'waiting' || session.mode !== 'staff') return;
    const id = window.setTimeout(() => setLongWait(true), LONG_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [session.status, session.mode]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, agentTyping, session.status]);

  const canModify = (m: ChatMessage) =>
    m.sender === 'student' && !m.removed && session.status !== 'closed' && now - new Date(m.createdAt).getTime() < EDIT_WINDOW_MS;
  const startEdit = (m: ChatMessage) => {
    setEditing(m);
    setText(m.body);
    setNotice(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };
  const cancelEdit = () => {
    setEditing(null);
    setText('');
  };
  const removeMsg = async (m: ChatMessage) => {
    if (!(await appConfirm(t.msgRemoveConfirm, { danger: true }))) return;
    socketRef.current?.emit('message:remove', { messageId: m.id }, (r: any) => {
      if (r?.ok) setMessages((prev) => prev.map((x) => (x.id === m.id ? r.message : x)));
      else setNotice(t.errors[r?.error] ?? t.errors.generic);
    });
    if (editing?.id === m.id) cancelEdit();
  };

  const send = () => {
    const body = text.trim();
    if (!body || !socketRef.current) return;
    setNotice(null);
    if (editing) {
      if (body === editing.body) return cancelEdit();
      socketRef.current.emit('message:edit', { messageId: editing.id, body }, (r: any) => {
        if (r?.ok) {
          setMessages((prev) => prev.map((x) => (x.id === r.message.id ? r.message : x)));
          cancelEdit();
        } else setNotice(t.errors[r?.error] ?? t.errors.generic);
      });
      return;
    }
    socketRef.current.emit('message:send', { sessionId: session.id, body }, (r: any) => {
      if (r?.ok) {
        addMessage(r.message);
        setText('');
      } else setNotice(t.errors[r?.error] ?? t.errors.generic);
    });
  };

  const onType = (v: string) => {
    setText(v);
    if (Date.now() - lastTypingSent.current > 2000 && v.trim()) {
      lastTypingSent.current = Date.now();
      socketRef.current?.emit('typing', { sessionId: session.id });
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return setNotice(t.errors.upload);
    setUploading(true);
    setNotice(null);
    try {
      const r = await chatApi.upload(session.id, file);
      addMessage(r.message);
    } catch {
      setNotice(t.errors.upload);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const end = async () => {
    if (!(await appConfirm(t.endConfirm))) return;
    socketRef.current?.emit('session:close', { sessionId: session.id });
  };

  const sendRating = async () => {
    try {
      await chatApi.rate(session.id, rating, comment);
    } finally {
      setRated(true);
    }
  };

  const closed = session.status === 'closed';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-line px-[20px] py-[10px]">
        <span className="flex items-center gap-[8px] text-f-sm text-ink-2">
          <span className={`h-[8px] w-[8px] rounded-full ${session.status === 'active' ? 'bg-[#22a55a]' : session.status === 'waiting' ? 'bg-[#e5a50a] animate-pulse' : 'bg-ink-3'}`} />
          {session.status === 'waiting' ? t.waiting(position) : session.status === 'active' ? t.active() : t.closed}
        </span>
        {!closed && (
          <button type="button" onClick={end} className="rounded-full px-[12px] py-[4px] text-f-sm font-5medium text-ink-2 hover:bg-card">
            {t.end}
          </button>
        )}
      </div>

      {/* 담당자에게 전달된 내 정보 (서버에 저장된 그대로) — 항목마다 태그 */}
      {session.profile && infoParts(t, session.profile).length > 0 && (
        <div className="flex items-center gap-[8px] border-b border-line px-[20px] py-[8px]">
          <span className="shrink-0 text-f-xs font-6semibold text-ink-3">{t.info.mine}</span>
          <div className="flex min-w-0 flex-wrap gap-[4px]">
            {infoParts(t, session.profile).map((part, i) => (
              <span
                key={i}
                className={`rounded-full px-[9px] py-[2px] text-f-xs ${
                  i === 0 && session.profile?.program ? 'bg-accent-ink/10 font-6semibold text-accent-ink' : 'bg-card font-5medium text-ink-2'
                }`}
              >
                {part}
              </span>
            ))}
          </div>
        </div>
      )}

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-[16px] py-[12px]" aria-live="polite">
        {messages.map((m) => (
          <Bubble key={m.id} m={m} t={t} canModify={canModify(m)} onEdit={() => startEdit(m)} onRemove={() => removeMsg(m)} />
        ))}
        {agentTyping && !closed && <p className="ml-[4px] mt-[4px] text-f-xs text-ink-3">{t.typing}</p>}
        {longWait && session.status === 'waiting' && (
          <div className="mt-[12px] rounded-[14px] bg-card p-[12px] text-f-sm">
            <p className="font-6semibold text-ink">{t.longWait}</p>
            <p className="mt-[2px] text-ink-2">{t.longWaitBody}</p>
            <ContactInfo t={t} email={officeEmail} />
          </div>
        )}
        {closed && (
          <div className="mt-[16px] rounded-[16px] bg-card px-[14px] py-[12px] text-center">
            {!session.startedAt ? (
              // 담당자가 연결된 적 없음 — 평가할 채팅이 없으므로 안내만
              <p className="text-f-sm text-ink-2">{t.endedBeforeConnect}</p>
            ) : rated ? (
              <p className="text-f-sm text-ink-2">{t.rated}</p>
            ) : (
              <>
                <p className="font-6semibold text-f-sm text-ink">{t.rateTitle}</p>
                <div className="my-[6px] flex justify-center gap-[2px]" role="radiogroup">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n}`}
                      onClick={() => setRating(n)}
                      className={`text-[calc(var(--fs-scale,1)*22px)] leading-none ${n <= rating ? 'text-[#f5b301]' : 'text-ink-3'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder={t.rateComment}
                  className="w-full rounded-[10px] border border-line bg-surface px-[10px] py-[6px] text-f-sm text-ink outline-none"
                />
                <button
                  type="button"
                  disabled={!rating}
                  onClick={sendRating}
                  className="mt-[8px] rounded-full bg-accent px-[16px] py-[5px] text-f-sm font-6semibold text-white disabled:opacity-50"
                >
                  {t.rateSend}
                </button>
              </>
            )}
            <button type="button" onClick={onNew} className="mt-[8px] block w-full text-f-sm text-ink-2 underline">
              {t.newChat}
            </button>
          </div>
        )}
      </div>

      {notice && <p className="mx-[16px] mb-[6px] rounded-[12px] bg-[rgb(var(--c-senior))] px-[12px] py-[6px] text-f-xs text-accent-ink">{notice}</p>}
      {!closed && editing && (
        <div className="flex items-center justify-between border-t-2 border-line bg-card px-[16px] py-[6px] text-f-xs">
          <span className="flex min-w-0 items-center gap-[6px] text-ink-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[13px] w-[13px] shrink-0" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
            </svg>
            <span className="shrink-0 font-6semibold">{t.editing}</span>
            <span className="truncate text-ink-3">{editing.body}</span>
          </span>
          <button type="button" onClick={cancelEdit} className="ml-[8px] shrink-0 rounded-full px-[8px] py-[2px] font-6semibold text-ink-2 hover:bg-card-2">
            {t.editCancel}
          </button>
        </div>
      )}
      {!closed && (
        // 높이·선 두께를 뒤의 호빗 입력창과 같게 (채팅 창을 열어도 아래 선이 한 줄로 이어짐)
        <div className={`flex items-end gap-[8px] px-[12px] py-[10px] md:py-[16px] ${editing ? '' : 'border-t-2 border-line'}`}>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <button
            type="button"
            title={t.attach}
            aria-label={t.attach}
            disabled={uploading} // 대기 중에도 첨부 가능 — 담당자가 연결되면 바로 확인 (종료된 채팅은 입력칸이 없음)
            onClick={() => fileRef.current?.click()}
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-card disabled:opacity-40 md:h-[48px] md:w-[48px]"
          >
            {uploading ? (
              <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent-ink" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-[24px] w-[24px] md:h-[27px] md:w-[27px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3" />
              </svg>
            )}
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => onType(e.target.value.slice(0, 2000))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
              if (e.key === 'Escape' && editing) cancelEdit();
            }}
            rows={1}
            placeholder={t.placeholder}
            // 줄 높이를 px로 고정 — 창을 넓혀 글자가 커져도 한 줄일 때 높이가 버튼과 같음 (40 / 48px)
            className="min-h-[40px] flex-1 resize-none overflow-y-auto rounded-[20px] border border-line bg-surface px-[14px] py-[7px] text-f-sm leading-[24px] text-ink outline-none focus:border-accent-ink md:min-h-[48px] md:rounded-[24px] md:py-[11px]"
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim()}
            className="h-[40px] shrink-0 rounded-full bg-accent px-[16px] text-f-sm font-6semibold text-white disabled:opacity-40 md:h-[48px] md:px-[18px]"
          >
            {editing ? t.editSave : t.send}
          </button>
        </div>
      )}
    </div>
  );
};

// ── 창 ───────────────────────────────────────────────────
const LiveChat: React.FC = () => {
  const dispatch = useDispatch();
  const { open, mode } = useSelector((s: RootState) => s.liveChat);
  const menuOpen = useSelector((s: RootState) => s.menu.isOpen);
  const isKorean = useSelector((s: RootState) => s.language.isKorean);
  const t = isKorean ? T.ko : T.en;
  const [step, setStep] = useState<Step>('loading');
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [room, setRoom] = useState<{ session: ChatSession; messages: ChatMessage[]; position: number } | null>(null);
  const [info, setInfo] = useState<StudentInfo>(loadInfo);
  const [infoBad, setInfoBad] = useState<(keyof StudentInfo)[]>([]);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [editInfo, setEditInfo] = useState(() => infoProblems(loadInfo()).length > 0); // 처음이거나 빠진 게 있으면 입력 칸부터
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(WIDTH_KEY)) || DEFAULT_W;
    } catch {
      return DEFAULT_W;
    }
  });

  const changeWidth = useCallback((w: number) => {
    const next = Math.round(Math.min(Math.max(w, MIN_W), maxWidth()));
    setWidth(next);
    try {
      localStorage.setItem(WIDTH_KEY, String(next));
    } catch {
      /* 이번 화면에서만 */
    }
  }, []);

  // 왼쪽 가장자리를 끌면 너비 변경 (오른쪽에 붙은 창이라 왼쪽으로 끌수록 넓어짐)
  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    const move = (ev: PointerEvent) => changeWidth(window.innerWidth - ev.clientX);
    const end = () => {
      document.body.style.userSelect = '';
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  };

  // 글자 크기: 채팅 창 너비에 비례 (기본 440px = 1배, 360px ≈ 0.92배 … 넓히면 최대 1.2배)
  // 모바일은 창이 화면을 가득 채우므로 화면 전체 배율 그대로. 위젯 모드(html.embed의 --fs-scale)도 곱함
  const [viewportW, setViewportW] = useState(() => window.innerWidth);
  const baseScale = Number(getComputedStyle(document.documentElement).getPropertyValue('--fs-scale')) || 1;
  const fontScale =
    viewportW < 768 ? baseScale : Number((baseScale * Math.min(1.2, Math.max(0.92, width / DEFAULT_W))).toFixed(3));

  // 창 크기가 줄면 채팅 창도 화면 안으로
  useEffect(() => {
    const onResize = () => {
      setViewportW(window.innerWidth);
      setWidth((w) => Math.min(w, maxWidth()));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const decide = useCallback(async () => {
    setStep('loading');
    setError(null);
    try {
      // 진행 중인 채팅이 있으면 바로 이어감
      if (getToken()) {
        try {
          const me = await chatApi.me();
          if (me.session) {
            setRoom({ session: me.session, messages: me.messages, position: me.position ?? 0 });
            // 다른 종류 채팅을 누른 경우 (예: 행정실 채팅 중에 선배 채팅) — 화면이 섞이지 않게 먼저 물어봄
            return setStep(me.session.mode !== mode ? 'switch' : 'chat');
          }
        } catch {
          clearToken();
        }
      }
      const st = await chatApi.status(mode);
      setStatus(st);
      if (!st.open) return setStep(mode === 'senior' ? 'away' : 'closed');
      return setStep(getToken() ? 'ready' : 'verify');
    } catch {
      setError(t.errors.generic);
      return setStep('error');
    }
  }, [mode, t]);

  useEffect(() => {
    if (open) decide();
  }, [open, decide]);

  // 메뉴와 채팅 창은 동시에 열지 않음 — 채팅 창을 열면 메뉴를 닫고, 메뉴를 열면 채팅 창을 닫음
  useEffect(() => {
    if (open) dispatch(closeMenu());
  }, [open, dispatch]);
  useEffect(() => {
    if (menuOpen) dispatch(closeLiveChat());
  }, [menuOpen, dispatch]);

  const start = async () => {
    // 학생 정보 확인 (과정·이름·학번·학과·학적 상태 모두 필수) — 빠진 칸을 표시
    const problems = infoProblems(info);
    setInfoBad(problems);
    if (problems.length) {
      setEditInfo(true);
      setInfoError(problems.includes('student_id') && info.student_id ? t.info.badId : t.info.required);
      return;
    }
    setInfoError(null);
    const profile = { ...info, name: info.name.trim(), department: info.department.trim(), student_id: info.student_id.trim() };
    saveInfo(profile);
    setStep('loading');
    try {
      const r = await chatApi.start({ mode, language: isKorean ? 'KO' : 'EN', profile, botContext: getRecentExchanges() });
      setRoom({ session: r.session, messages: r.messages, position: r.position });
      setStep('chat');
    } catch (e) {
      // 그 사이 운영시간이 끝났거나 선배가 자리를 비웠을 수 있음
      if (e instanceof ChatApiError && (e.code === 'closed_hours' || e.code === 'away')) return decide();
      setError(e instanceof ChatApiError && e.message ? e.message : t.errors.generic);
      setStep('error');
    }
  };

  if (!open) return null;

  return (
    <>
    {/* 배경 — 누르면 채팅 창 닫힘 (채팅은 서버에 있어 다시 열면 이어짐) */}
    <div className="fixed inset-0 z-[79] bg-black/20 hobit-appear" aria-hidden="true" onClick={() => dispatch(closeLiveChat())} />
    <div
      className="fixed inset-y-0 right-0 z-[80] flex w-full flex-col bg-page shadow-2xl md:w-[var(--livechat-w)] md:border-l md:border-line hobit-appear"
      style={{ ['--livechat-w' as string]: `${width}px`, ['--fs-scale' as string]: String(fontScale) }}
      role="dialog"
      aria-label={mode === 'senior' ? t.senior : t.staff}
    >
      {/* 너비 조절 (데스크톱) — 끌거나, 키보드 ←→ */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={isKorean ? '채팅 창 너비 조절' : 'Resize chat'}
        aria-valuenow={width}
        aria-valuemin={MIN_W}
        aria-valuemax={maxWidth()}
        tabIndex={0}
        onPointerDown={startResize}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') changeWidth(width + 40);
          if (e.key === 'ArrowRight') changeWidth(width - 40);
        }}
        onDoubleClick={() => changeWidth(DEFAULT_W)}
        className="group absolute inset-y-0 -left-[4px] z-10 hidden w-[8px] cursor-ew-resize md:block"
      >
        <span className="absolute inset-y-0 left-[3px] w-[2px] bg-transparent transition-colors group-hover:bg-accent-ink/40 group-focus-visible:bg-accent-ink/60" />
      </div>
      {/* 호빗 상단 바와 같은 높이 → 아래 테두리가 한 줄로 이어짐 */}
      <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-line px-[20px] md:h-[70px]">
        <div className="min-w-0">
          <p className="flex items-center gap-[6px] font-7bold text-f-lg text-ink">
            <IoChatbubbles className="shrink-0 text-[0.9em] text-[#E55604]" aria-hidden="true" />
            {mode === 'senior' ? t.senior : t.staff}
          </p>
          {status?.open && status.hours?.today && step !== 'chat' && <p className="text-f-xs text-ink-3">{t.hours(status)}</p>}
        </div>
        <button
          type="button"
          onClick={() => dispatch(closeLiveChat())}
          aria-label={t.close}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-ink-2 hover:bg-card"
        >
          <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      {step === 'loading' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-[10px] text-f-sm text-ink-3">
          <span className="h-[26px] w-[26px] animate-spin rounded-full border-[3px] border-line border-t-accent-ink" />
          {t.loading}
        </div>
      )}

      {step === 'away' && (
        <div className="p-[20px]">
          <section className="rounded-[16px] bg-card p-[16px]">
            <p className="font-6semibold text-f-base text-ink">{t.awayTitle}</p>
            <p className="mt-[4px] text-f-sm text-ink-2">{t.awayBody}</p>
          </section>
          <button type="button" onClick={decide} className="mt-[12px] w-full rounded-full bg-card py-[10px] text-f-sm font-6semibold text-ink hover:bg-card-2">
            {t.retry}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Verify t={t} onDone={() => setStep('ready')} skipCode={status?.emailVerification === false} />
        </div>
      )}

      {step === 'closed' && status && (
        <div className="min-h-0 flex-1 overflow-y-auto p-[20px]">
          <section className="rounded-[16px] bg-card p-[16px]">
            <p className="font-6semibold text-f-base text-ink">{t.offlineTitle}</p>
            <p className="mt-[4px] text-f-sm text-ink-2">{t.hours(status)}</p>
            <p className="mt-[8px] text-f-sm text-ink-2">{t.offlineBody}</p>
            <ContactInfo t={t} email={status.officeEmail} />
          </section>
        </div>
      )}

      {step === 'ready' && (
        <div className="min-h-0 flex-1 overflow-y-auto p-[20px]">
          {/* 안내 */}
          <section className="rounded-[16px] bg-card p-[16px]">
            <p className="font-6semibold text-f-base text-ink">{t.readyTitle(mode)}</p>
            <p className="mt-[4px] text-f-sm leading-relaxed text-ink-2">{t.readyBody}</p>
            <span className="mt-[10px] inline-flex items-center gap-[6px] rounded-full bg-surface px-[10px] py-[4px] text-f-xs text-ink-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[12px] w-[12px]" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {getToken()?.email}
            </span>
          </section>

          {/* 학생 정보 */}
          <section className="mt-[12px] rounded-[16px] border border-line bg-surface p-[16px]">
            <div className={`flex items-center justify-between ${editInfo ? 'mb-[14px]' : ''}`}>
              <p className="font-6semibold text-f-base text-ink">{t.info.title}</p>
              {editInfo ? (
                <span className="text-f-xs text-ink-3">{t.info.allRequired}</span>
              ) : (
                <button type="button" onClick={() => setEditInfo(true)} className="rounded-full bg-card px-[12px] py-[4px] text-f-xs font-6semibold text-ink-2 hover:bg-card-2">
                  {t.info.edit}
                </button>
              )}
            </div>
            {!editInfo ? (
              // 저장된 정보가 있으면 한 줄 요약만 (고치려면 "수정")
              <>
                <div className="mt-[10px] flex flex-wrap gap-[6px]">
                  {infoParts(t, info).map((part, i) => (
                    <span
                      key={i}
                      className={`rounded-full px-[10px] py-[3px] text-f-sm ${i === 0 ? 'bg-accent-ink/10 font-6semibold text-accent-ink' : 'bg-card font-5medium text-ink'}`}
                    >
                      {part}
                    </span>
                  ))}
                </div>
                {mode === 'senior' && <p className="mt-[6px] text-f-xs text-ink-3">{t.info.seniorNote}</p>}
              </>
            ) : (
            <StudentInfoForm
              t={t}
              mode={mode}
              value={info}
              bad={infoBad}
              onChange={(v) => {
                setInfo(v);
                // 고친 칸은 빨간 표시를 지움 (아직 틀린 칸만 남김)
                const still = infoProblems(v);
                setInfoBad((b) => b.filter((k) => still.includes(k)));
              }}
            />
            )}
          </section>

          {infoError && (
            <p role="alert" className="mt-[10px] text-center text-f-xs font-5medium" style={{ color: DANGER }}>
              {infoError}
            </p>
          )}
          <button type="button" onClick={start} className="mt-[12px] h-[46px] w-full rounded-full bg-accent text-f-base font-6semibold text-white transition-opacity hover:opacity-90">
            {t.start}
          </button>
        </div>
      )}

      {step === 'switch' && room && (
        <div className="p-[20px]">
          <section className="rounded-[16px] bg-card p-[16px]">
            <p className="font-6semibold text-f-base text-ink">{t.switchTitle(room.session.mode)}</p>
            <p className="mt-[4px] text-f-sm text-ink-2">{t.switchBody(room.session.mode, mode)}</p>
          </section>
          <button
            type="button"
            onClick={() => dispatch(openLiveChat(room.session.mode))}
            className="mt-[14px] h-[46px] w-full rounded-full bg-accent text-f-base font-6semibold text-white transition-opacity hover:opacity-90"
          >
            {t.switchBack(room.session.mode)}
          </button>
          <button
            type="button"
            onClick={async () => {
              setStep('loading');
              await chatApi.close(room.session.id).catch(() => undefined);
              setRoom(null);
              decide();
            }}
            className="mt-[8px] h-[46px] w-full rounded-full bg-card text-f-base font-6semibold text-ink transition-colors hover:bg-card-2"
          >
            {t.switchGo(mode)}
          </button>
        </div>
      )}

      {step === 'chat' && room && <ChatRoom t={t} initial={room} officeEmail={status?.officeEmail ?? 'cscoi@korea.ac.kr'} onNew={decide} />}



      {step === 'error' && (
        <div className="p-[20px]">
          <p className="rounded-[16px] bg-card p-[16px] text-f-sm text-ink">{error}</p>
          <button type="button" onClick={decide} className="mt-[12px] w-full rounded-full bg-card py-[10px] text-f-sm font-6semibold text-ink hover:bg-card-2">
            {t.retry}
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default LiveChat;
