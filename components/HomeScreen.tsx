import React, { useMemo, useRef } from 'react';
import { Post, Category, Announcement, Advertisement } from '../types';
import AdBanner from './AdBanner';
import HorizontalPostSlider from './HorizontalPostSlider';
import { CATEGORIES } from '../constants';
import MegaphoneIcon from './icons/MegaphoneIcon';

interface HomeScreenProps {
  posts: Post[];
  announcements: Announcement[];
  advertisements: Advertisement[];
  onNavigateToBoard: (category: Category) => void;
  onSelectPost: (post: Post) => void;
  onToggleBookmark: (postId: string) => void;
  onShowAnnouncements: () => void;
}

const CategoryButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 group">
        {icon}
        <span className="text-base font-bold text-gray-700">{label}</span>
    </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ posts, announcements, advertisements, onNavigateToBoard, onSelectPost, onToggleBookmark, onShowAnnouncements }) => {
    const mainRef = useRef<HTMLDivElement>(null);
    
    const postsByCategory = useMemo(() => {
        const grouped: { [key in Category]?: Post[] } = {};
        for (const category of CATEGORIES) {
            grouped[category.id] = posts
                .filter(post => post.category === category.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10); // Take top 10 for sliders
        }
        return grouped;
    }, [posts]);

    const latestAnnouncement = useMemo(() => {
        if (!announcements || announcements.length === 0) return null;
        return [...announcements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }, [announcements]);
  
  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <main ref={mainRef} className="w-full flex-grow overflow-y-auto hide-scrollbar pb-20">
        <div className="px-4 pt-4">
          <AdBanner advertisements={advertisements} />
        </div>

        <section className="py-4 px-4">
            <div className="grid grid-cols-4 gap-4 text-center">
                <CategoryButton 
                    icon={<img src="https://i.imgur.com/QmYRxvE.png" alt="구인" className="w-14 h-14" />} 
                    label="구인" 
                    onClick={() => onNavigateToBoard(Category.JOB_POSTING)} 
                />
                <CategoryButton 
                    icon={<img src="https://i.imgur.com/eZ8EDjo.png" alt="구직" className="w-14 h-14" />} 
                    label="구직" 
                    onClick={() => onNavigateToBoard(Category.JOB_SEEKING)} 
                />
                <CategoryButton 
                    icon={<img src="https://i.imgur.com/rqURSJg.png" alt="시설양도" className="w-14 h-14" />} 
                    label="시설양도" 
                    onClick={() => onNavigateToBoard(Category.COURT_TRANSFER)} 
                />
                <CategoryButton 
                    icon={<img src="https://i.imgur.com/GjPTbEr.png" alt="자유게시판" className="w-14 h-14" />} 
                    label="자유게시판" 
                    onClick={() => onNavigateToBoard(Category.FREE_BOARD)} 
                />
            </div>
        </section>

        {latestAnnouncement && (
          <section className="px-4 pb-2">
              <button 
                  onClick={onShowAnnouncements}
                  className="w-full bg-gray-100 rounded-full p-3 flex items-center space-x-3 text-left hover:bg-gray-200 transition-colors"
                  aria-label={`공지사항: ${latestAnnouncement.title}`}
              >
                  <MegaphoneIcon className="w-5 h-5 text-[#fe5610] flex-shrink-0" />
                  <span className="text-sm font-medium text-black truncate flex-1">
                      {latestAnnouncement.title}
                  </span>
              </button>
          </section>
        )}
        
        <div className="pt-2 pb-4 space-y-2">
            <HorizontalPostSlider 
                title="구인"
                posts={postsByCategory[Category.JOB_POSTING] || []}
                onSelectPost={onSelectPost}
                onSeeMore={() => onNavigateToBoard(Category.JOB_POSTING)}
                onToggleBookmark={onToggleBookmark}
            />
             <HorizontalPostSlider 
                title="구직"
                posts={postsByCategory[Category.JOB_SEEKING] || []}
                onSelectPost={onSelectPost}
                onSeeMore={() => onNavigateToBoard(Category.JOB_SEEKING)}
                onToggleBookmark={onToggleBookmark}
                displayAs="listItem"
                autoScroll={true}
            />
             <HorizontalPostSlider 
                title="시설양도"
                posts={postsByCategory[Category.COURT_TRANSFER] || []}
                onSelectPost={onSelectPost}
                onSeeMore={() => onNavigateToBoard(Category.COURT_TRANSFER)}
                onToggleBookmark={onToggleBookmark}
            />
             <HorizontalPostSlider 
                title="자유게시판"
                posts={postsByCategory[Category.FREE_BOARD] || []}
                onSelectPost={onSelectPost}
                onSeeMore={() => onNavigateToBoard(Category.FREE_BOARD)}
                onToggleBookmark={onToggleBookmark}
                displayAs="listItem"
                autoScroll={true}
            />
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;