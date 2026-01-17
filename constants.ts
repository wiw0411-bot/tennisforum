
import { Category } from './types';

export const CATEGORIES: { id: Category; name: string, title: string }[] = [
  { id: Category.JOB_POSTING, name: '구인', title: '구인정보' },
  { id: Category.JOB_SEEKING, name: '구직', title: '구직정보' },
  { id: Category.COURT_TRANSFER, name: '시설양도', title: '시설양도' },
  { id: Category.FREE_BOARD, name: '자유게시판', title: '자유게시판' },
];