import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';
import PostListItem from './PostListItem';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface HorizontalPostSliderProps {
  title: string;
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onSeeMore: () => void;
  onToggleBookmark: (postId: string) => void;
  hideImage?: boolean;
  displayAs?: 'card' | 'listItem';
  autoScroll?: boolean;
}

const HorizontalPostSlider: React.FC<HorizontalPostSliderProps> = ({ title, posts, onSelectPost, onSeeMore, onToggleBookmark, hideImage = false, displayAs = 'card', autoScroll = false }) => {
  if (posts.length === 0) return null;

  const renderAsListItem = displayAs === 'listItem';

  const content = (autoScroll ? [...posts, ...posts] : posts).map((post, index) => (
    <div key={`${post.id}-${index}`} className={`${renderAsListItem ? 'w-72' : 'w-24'} flex-shrink-0`}>
      {renderAsListItem ? (
        <PostListItem post={post} onSelectPost={onSelectPost} onToggleBookmark={onToggleBookmark} />
      ) : (
        <PostCard post={post} onSelectPost={onSelectPost} hideImage={hideImage} />
      )}
    </div>
  ));

  return (
    <section className="py-4">
      <div className="flex justify-between items-center mb-3 px-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onSeeMore} className="flex items-center text-xs font-semibold text-[#ff5710] hover:underline">
          더보기 <ChevronRightIcon />
        </button>
      </div>
      <div className={`overflow-hidden ${!autoScroll ? 'px-4' : ''}`}>
        <div className={`flex space-x-4 ${autoScroll ? 'animate-marquee' : 'overflow-x-auto hide-scrollbar'}`}>
          {content}
        </div>
      </div>
    </section>
  );
};

export default HorizontalPostSlider;