import React from 'react';
import BellIcon from './icons/BellIcon';

const NotificationsListScreen: React.FC = () => {
  return (
    <div className="animate-fade-in h-full flex flex-col">
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">알림</h1>
      </header>
      <main className="flex-grow bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <BellIcon />
        </div>
        <h2 className="text-lg font-bold text-gray-800">알림 기능은 곧 출시 예정입니다.</h2>
        <p className="text-sm text-gray-500 mt-2">
          더욱 편리한 알림 기능을 준비하고 있습니다.
          <br />
          조금만 기다려주세요!
        </p>
      </main>
    </div>
  );
};

export default NotificationsListScreen;
