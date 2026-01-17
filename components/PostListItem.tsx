import React from 'react';
import { Post, Category } from '../types';
import { formatDays } from '../utills/formatDays';
import DefaultPostIcon from './icons/DefaultPostIcon';
import BookmarkSolidIcon from './icons/BookmarkSolidIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import CommentIcon from './icons/CommentIcon';
import EyeIcon from './icons/EyeIcon';

interface PostListItemProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  onToggleBookmark: (postId: string) => void;
}

const PostListItem: React.FC<PostListItemProps> = ({ post, onSelectPost, onToggleBookmark }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(post.id);
  };

  const PostCardFooter = () => (
    <div className="flex items-center space-x-3 text-[11px] text-gray-400 flex-shrink-0 pl-2">
        <div className="flex items-center">
            <EyeIcon className="w-3.5 h-3.5 mr-1" />
            <span>{post.views}</span>
        </div>
        <div className="flex items-center">
            <CommentIcon className="w-3.5 h-3.5 mr-1" />
            <span>{post.comments?.length || 0}</span>
        </div>
        <button onClick={handleBookmarkClick} className="flex items-center focus:outline-none" aria-label={post.isBookmarked ? '스크랩 취소' : '스크랩'}>
            {post.isBookmarked ? (
                <BookmarkSolidIcon className="w-4 h-4 text-[#ff5710]" />
            ) : (
                <BookmarkIcon className="w-4 h-4" />
            )}
        </button>
    </div>
  );
  
  if (post.category === Category.JOB_SEEKING) {
    const careerSummaryParts = [];
    if (post.playerCareer) careerSummaryParts.push(`선수 ${post.playerCareer}년`);
    if (post.hasLessonCareer && post.lessonCareer) {
      careerSummaryParts.push(`레슨 ${post.lessonCareer}년+`);
    } else if (post.hasLessonCareer === false) {
       careerSummaryParts.push(`레슨경력 없음`);
    }
    if (post.field) careerSummaryParts.push(post.field);
    const careerSummary = careerSummaryParts.join(' | ');

    const detailsSummaryParts = [];
    let workInfo = '';
    if (post.workingType) {
        workInfo = post.workingType;
        if (post.workingDays?.includes('요일 협의') && post.workingHours === '시간 협의') {
            if (workInfo !== '협의') {
                workInfo += ' (요일/시간 협의)';
            }
        }
    }
    if(workInfo) detailsSummaryParts.push(workInfo);
    if (post.memberManagementSkill) detailsSummaryParts.push(`회원관리(${post.memberManagementSkill})`);
    if (post.counselingSkill) detailsSummaryParts.push(`상담 ${post.counselingSkill}`);
    const detailsSummary = detailsSummaryParts.join(' | ');


    return (
      <div
        className="bg-white rounded-lg p-3 cursor-pointer border border-gray-200 flex items-center space-x-3"
        onClick={() => onSelectPost(post)}
      >
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-xs text-gray-500 truncate pr-2">
              {post.location}
              {post.recruitmentField && ` / 지원분야: ${post.recruitmentField}`}
            </p>
          </div>
          <p className="font-extrabold text-sm text-[#ff5710] truncate mt-0.5">
            {careerSummary}
          </p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-800 truncate">
              {detailsSummary}
            </p>
            <PostCardFooter />
          </div>
        </div>
      </div>
    );
  }

  if (post.category === Category.COURT_TRANSFER) {
    return (
      <div
        className="bg-white rounded-lg p-3 cursor-pointer border border-gray-200 flex space-x-3 items-center"
        onClick={() => onSelectPost(post)}
      >
        <div className="relative flex-shrink-0">
          {post.imageUrl ? (
            <img
              className="w-16 h-16 object-cover rounded-lg"
              src={post.imageUrl}
              alt={post.title}
            />
          ) : (
            <DefaultPostIcon className="w-16 h-16 rounded-lg" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-xs text-gray-500 truncate pr-2">{post.location}</p>
          </div>
          
          {post.monthlyRent ? (
             <>
                <h3 className="font-bold text-sm text-black truncate mt-0.5">
                    {post.courtType}{post.area && ` | ${post.area}`}
                </h3>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-[#ff5710] font-semibold truncate">월세 {post.monthlyRent}</p>
                    <PostCardFooter />
                </div>
             </>
          ) : (
            <div className="flex justify-between items-center mt-0.5">
                <h3 className="font-bold text-sm text-black truncate">
                    {post.courtType}{post.area && ` | ${post.area}`}
                </h3>
                <PostCardFooter />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (post.category === Category.FREE_BOARD) {
    return (
      <div
        className="bg-white rounded-lg p-3 cursor-pointer border border-gray-200 flex space-x-3 items-center"
        onClick={() => onSelectPost(post)}
      >
        <div className="relative flex-shrink-0">
          {post.imageUrl ? (
            <img
              className="w-16 h-16 object-cover rounded-lg"
              src={post.imageUrl}
              alt={post.title}
            />
          ) : (
            <DefaultPostIcon className="w-16 h-16 rounded-lg" />
          )}
        </div>
        <div className="flex-grow min-w-0 flex flex-col justify-between self-stretch">
            <div>
                <h3 className="font-bold text-sm text-black line-clamp-2">
                    <span className="text-[#ff5710] font-bold">[{post.subCategory}] </span>
                    {post.title}
                </h3>
            </div>
            <div className="flex justify-end">
                <PostCardFooter />
            </div>
        </div>
      </div>
    );
  }

  // Default layout for JOB_POSTING
  const workingDaysDisplay = formatDays(post.workingDays);
  const workingInfo = [workingDaysDisplay, post.workingType].filter(Boolean).join(' ');

  return (
    <div
      className="bg-white rounded-lg p-3 cursor-pointer border border-gray-200 flex space-x-3 items-center"
      onClick={() => onSelectPost(post)}
    >
      <div className="relative flex-shrink-0">
        {post.imageUrl ? (
          <img
            className="w-16 h-16 object-cover rounded-lg"
            src={post.imageUrl}
            alt={post.title}
          />
        ) : (
          <DefaultPostIcon className="w-16 h-16 rounded-lg" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start">
            <p className="text-xs text-gray-500 truncate pr-2">
                {post.location}
                {post.recruitmentField && <span> | 모집분야: {post.recruitmentField}</span>}
            </p>
        </div>
        {workingInfo ? (
            <>
                <h3 className="font-bold text-sm text-[#ff5710] truncate mt-0.5">{post.title}</h3>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-700 truncate">{workingInfo}</p>
                    <PostCardFooter />
                </div>
            </>
        ) : (
            <div className="flex justify-between items-center mt-0.5">
                <h3 className="font-bold text-sm text-[#ff5710] truncate">{post.title}</h3>
                <PostCardFooter />
            </div>
        )}
      </div>
    </div>
  );
};

export default PostListItem;