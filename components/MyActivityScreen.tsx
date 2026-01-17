import React, { useState, useMemo } from 'react';
import { Post } from '../types';
import PostList from './PostList';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import SearchIcon from './icons/SearchIcon';

interface MyActivityScreenProps {
  title: string;
  posts: Post[];
  onBack: () => void;
  onSelectPost: (post: Post) => void;
  onToggleBookmark: (postId: string) => void;
}

const MyActivityScreen: React.FC<MyActivityScreenProps> = ({ title, posts, onBack, onSelectPost, onToggleBookmark }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return posts
      .filter(post => 
        lowercasedQuery === '' ||
        post.title.toLowerCase().includes(lowercasedQuery) ||
        post.author.toLowerCase().includes(lowercasedQuery)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, searchQuery]);

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
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </header>
      <main className="flex-grow p-4 pb-20 bg-gray-50 overflow-y-auto hide-scrollbar">
        <div className="relative mb-4">
          <input 
              type="text"
              placeholder="제목, 작성자 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] placeholder-gray-500 text-gray-800 border"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {filteredPosts.length > 0 ? (
          <PostList 
            posts={filteredPosts} 
            onSelectPost={onSelectPost} 
            onToggleBookmark={onToggleBookmark} 
          />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">
              {searchQuery ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyActivityScreen;