import React, { useState } from 'react';
import { Announcement } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { sanitizeHTML } from '../utills/sanitize';

interface AnnouncementsScreenProps {
  announcements: Announcement[];
  onBack: () => void;
}

const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({ announcements, onBack }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };
  
  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
          aria-label="뒤로가기"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">공지사항</h1>
      </header>
      <main className="flex-grow bg-white overflow-y-auto hide-scrollbar">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedAnnouncements.map((ann) => (
              <div key={ann.id}>
                <button
                  onClick={() => toggleAccordion(ann.id)}
                  className="w-full text-left p-4 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <h2 className="font-semibold text-sm text-gray-800">{ann.title}</h2>
                      <p className="text-xs text-gray-500 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        openId === ann.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                {openId === ann.id && (
                  <div className="p-4 pt-0">
                    {ann.imageUrl && (
                        <img src={ann.imageUrl} alt={ann.title} className="w-full h-auto object-cover rounded-lg mb-4" />
                    )}
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: sanitizeHTML(ann.content) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnouncementsScreen;