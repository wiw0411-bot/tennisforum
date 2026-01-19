import React, { useState, useEffect } from 'react';
import { Announcement } from '../types';
import MegaphoneIcon from './icons/MegaphoneIcon';

interface AnnouncementTickerProps {
  announcements: Announcement[];
  onShowAnnouncements: () => void;
}

const AnnouncementTicker: React.FC<AnnouncementTickerProps> = ({ announcements, onShowAnnouncements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
        setIsFading(false);
      }, 300); // fade-out duration
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <button
      onClick={onShowAnnouncements}
      className="w-full bg-gray-100 rounded-full p-3 flex items-center space-x-3 text-left hover:bg-gray-200 transition-colors"
      aria-label={`공지사항: ${currentAnnouncement.title}`}
    >
      <MegaphoneIcon className="w-5 h-5 text-[#fe5610] flex-shrink-0" />
      <div className="flex-1 overflow-hidden h-5 flex items-center">
        <span
          className={`text-sm font-medium text-black truncate transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
          key={currentAnnouncement.id}
        >
          {currentAnnouncement.title}
        </span>
      </div>
    </button>
  );
};

export default AnnouncementTicker;
