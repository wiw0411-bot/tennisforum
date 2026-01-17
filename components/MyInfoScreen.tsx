import React from 'react';
import { User } from '../types';
import UserCircleIcon from './icons/UserCircleIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import BellIcon from './icons/BellIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import PowerIcon from './icons/PowerIcon';

interface MyInfoScreenProps {
  currentUser: User | null;
  onLogout: () => void;
  onShowPrivacyPolicy: () => void;
  onShowTerms: () => void;
  onShowMyPosts: () => void;
  onShowMyBookmarks: () => void;
  onShowAnnouncements: () => void;
  onShowProfileEdit: () => void;
}

const MyInfoScreen: React.FC<MyInfoScreenProps> = ({ currentUser, onLogout, onShowPrivacyPolicy, onShowTerms, onShowMyPosts, onShowMyBookmarks, onShowAnnouncements, onShowProfileEdit }) => {

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400">{title}</h3>
      <ul>{children}</ul>
    </div>
  );

  const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; hasChevron?: boolean }> = ({ icon, label, onClick, hasChevron = true }) => (
    <li onClick={onClick} className={`flex items-center justify-between p-4 text-sm font-medium text-gray-800 transition-colors border-t border-gray-100 first:border-t-0 ${onClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default hover:bg-white'}`}>
      <div className="flex items-center">
        <div className="w-6 text-gray-500">{icon}</div>
        <span className="ml-3">{label}</span>
      </div>
      {hasChevron && <ChevronRightIcon />}
    </li>
  );
  
  const handleContactClick = () => {
    const contactUrl = 'https://naver.me/F6n0Pyj4';
    window.open(contactUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
       <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">내 정보</h1>
      </header>
      <main className="flex-grow p-4 pb-20 bg-gray-50 overflow-y-auto hide-scrollbar">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="프로필 사진" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            ) : (
                <UserCircleIcon className="w-16 h-16 text-gray-300 flex-shrink-0" />
            )}
            <div className="ml-4">
              <p className="font-bold text-lg text-gray-800">{currentUser?.name || '사용자'}</p>
              <button onClick={onShowProfileEdit} className="mt-1 text-xs font-semibold text-white bg-[#ff5710] px-3 py-1 rounded-full hover:bg-[#e64e0e] transition-colors">
                프로필 수정
              </button>
            </div>
          </div>
          
          {/* My Activity Section */}
          <Section title="나의 활동">
            <MenuItem icon={<DocumentTextIcon />} label="내가 쓴 글" onClick={onShowMyPosts} />
            <MenuItem icon={<BookmarkIcon />} label="관심 목록 (스크랩)" onClick={onShowMyBookmarks} />
          </Section>

          {/* App Settings Section */}
          <Section title="앱 설정">
            <MenuItem icon={<BellIcon />} label="알림 설정" hasChevron={false} />
            <MenuItem icon={<PowerIcon />} label="로그아웃" onClick={onLogout} />
          </Section>
          
          {/* Customer Center Section */}
          <Section title="고객센터">
            <MenuItem icon={<MegaphoneIcon />} label="공지사항" onClick={onShowAnnouncements} />
            <MenuItem icon={<DocumentTextIcon />} label="이용약관" onClick={onShowTerms} />
            <MenuItem icon={<DocumentTextIcon />} label="개인정보처리방침" onClick={onShowPrivacyPolicy} />
            <MenuItem icon={<QuestionMarkCircleIcon />} label="문의하기" onClick={handleContactClick} />
            <li className="flex items-center justify-between p-4 text-sm font-medium text-gray-800 border-t border-gray-100">
              <span className="text-xs text-gray-500">앱 버전</span>
              <span className="text-xs text-gray-500 font-semibold">1.0.1</span>
            </li>
          </Section>
        </div>
      </main>
    </div>
  );
};

export default MyInfoScreen;
