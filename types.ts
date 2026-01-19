

export enum Category {
  JOB_POSTING = 'JOB_POSTING',
  JOB_SEEKING = 'JOB_SEEKING',
  COURT_TRANSFER = 'COURT_TRANSFER',
  FREE_BOARD = 'FREE_BOARD',
}

export type FreeBoardSubCategory = '질문' | '정보 공유' | '중고마켓' | '자유이야기';

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id:string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
  isBookmarked?: boolean;
  category: Category;
  location: string;
  title: string;
  recruitmentField?: '테니스' | '피클볼';
  workingType?: '풀타임' | '파트타임' | '협의';
  workingHours?: string;
  workingDays?: string[];
  salary?: string;
  content: string;
  imageUrl?: string;
  contentImages?: string[];
  views: number;
  createdAt: string;
  commentsAllowed: boolean;
  comments?: Comment[];
  
  // Fields for JOB_SEEKING
  field?: '테니스' | '소프트테니스' | '동호인';
  playerCareer?: string;
  lessonCareer?: string;
  hasLessonCareer?: boolean;
  memberManagementSkill?: '상' | '중' | '하';
  counselingSkill?: '가능' | '불가능';

  // Fields for COURT_TRANSFER
  courtType?: '실내' | '실외' | '실내/외';
  premium?: string;
  fullCourtCount?: number;
  halfCourtCount?: number;
  ballMachineCount?: number;
  area?: string;
  monthlyRent?: string;
  maintenanceFee?: string;
  activeMembers?: string;
  averageRevenue?: string;

  // Fields for FREE_BOARD
  subCategory?: FreeBoardSubCategory;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Advertisement {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  createdAt: string;
  phone?: string;
  phoneVerified?: boolean;
}

export enum NotificationType {
  NEW_COMMENT_YOUR_POST = 'NEW_COMMENT_YOUR_POST',
  NEW_COMMENT_SUBSCRIBED_POST = 'NEW_COMMENT_SUBSCRIBED_POST',
  NEW_ANNOUNCEMENT = 'NEW_ANNOUNCEMENT'
}

export interface Notification {
  id: string;
  type: NotificationType;
  text: string;
  postTitle?: string;
  createdAt: string;
  read: boolean;
}

// For Schedule/Revenue Feature
export type IncomeType = 'hourly' | 'split';
export type LessonType = 'private' | 'duet' | 'magic' | 'group' | 'other';

export const LESSON_TYPES: LessonType[] = ['private', 'duet', 'magic', 'group', 'other'];
export const LESSON_TYPE_NAMES: Record<LessonType, string> = {
  private: '개인레슨',
  duet: '듀엣레슨',
  magic: '매직테니스',
  group: '그룹레슨',
  other: '기타',
};

export interface RateSetting {
  type: IncomeType;
  amount: number;
}

export type LessonRates = {
  [key in LessonType]?: RateSetting;
};

export interface LessonRateSettings {
  weekday: LessonRates;
  weekend: LessonRates;
}

export interface LocationRateProfile {
    id: string;
    name: string;
    rates: LessonRateSettings;
}

export type LessonCounts = Record<LessonType, number>;

export interface DailyRevenue {
  locationId: string;
  locationName: string;
  counts: LessonCounts;
  total: number;
  duration?: 20 | 30 | 60;
}

export interface RevenueData {
  [date: string]: DailyRevenue[]; // key is YYYY-MM-DD
}

// For Schedule Notes Feature
export type NoteType = 'work' | 'noShow' | 'makeupClass' | 'specialNote';

export const NOTE_TYPES: NoteType[] = ['work', 'noShow', 'makeupClass', 'specialNote'];
export const NOTE_TYPE_NAMES: Record<NoteType, string> = {
    work: '업무',
    noShow: '노쇼',
    makeupClass: '보강',
    specialNote: '특이사항',
};

export interface DailyNote {
  id: string;
  type: NoteType;
  memo: string;
}

export interface NotesData {
  [date: string]: DailyNote[]; // key is YYYY-MM-DD
}