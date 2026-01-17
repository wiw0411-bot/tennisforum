import React from 'react';
import HomeIcon from './icons/HomeIcon';
import CalendarIcon from './icons/CalendarIcon';
import BellIcon from './icons/BellIcon';
import UserIcon from './icons/UserIcon';

type Tab = 'home' | 'schedule' | 'notifications' | 'myInfo';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NavButton: React.FC<{
  label: string;
  tab: Tab;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
  children: React.ReactNode;
}> = ({ label, tab, activeTab, onClick, children }) => {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`flex flex-col items-center justify-center p-2 transition-colors w-1/4 ${
        isActive ? 'text-[#ff5710]' : 'text-gray-400 hover:text-[#ff5710]'
      }`}
    >
      {children}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="absolute bottom-0 w-full bg-white border-t z-20">
      <div className="flex justify-around h-16 items-center">
        <NavButton label="홈" tab="home" activeTab={activeTab} onClick={onTabChange}>
          <HomeIcon />
        </NavButton>
        <NavButton label="스케줄" tab="schedule" activeTab={activeTab} onClick={onTabChange}>
          <CalendarIcon />
        </NavButton>
        <NavButton label="알림" tab="notifications" activeTab={activeTab} onClick={onTabChange}>
          <BellIcon />
        </NavButton>
        <NavButton label="내 정보" tab="myInfo" activeTab={activeTab} onClick={onTabChange}>
          <UserIcon />
        </NavButton>
      </div>
    </nav>
  );
};

export default BottomNav;