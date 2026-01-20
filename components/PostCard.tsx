import React from 'react';
import { Post, Category } from '../types';
import DefaultPostIcon from './icons/DefaultPostIcon';
import { formatDays } from '../utills/formatDays';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  hideImage?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onSelectPost, hideImage = false }) => {
  const isFreeBoard = post.category === Category.FREE_BOARD;
  const isJobPosting = post.category === Category.JOB_POSTING;
  const isJobSeeking = post.category === Category.JOB_SEEKING;
  const isCourtTransfer = post.category === Category.COURT_TRANSFER;
  
  const workingDaysDisplay = formatDays(post.workingDays);
  const workingInfo = [workingDaysDisplay, post.workingType].filter(Boolean).join(' ');

  const TextContent = () => (
    <div className="space-y-0.5">
      {isFreeBoard && post.subCategory && (
          <p className="text-[10px] text-[#ff5710] font-bold truncate">[{post.subCategory}]</p>
      )}
      <h3 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#ff5710] transition-colors">{post.title}</h3>
      
      {isJobSeeking ? (
          <>
              <p className="text-[11px] text-gray-700 truncate">
                  {post.hasLessonCareer && post.lessonCareer ? `레슨 ${post.lessonCareer}년 이상` : '레슨경력 없음'}
              </p>
              {post.workingType && <p className="text-[11px] text-gray-700 truncate">{post.workingType}</p>}
          </>
      ) : isCourtTransfer ? (
          <>
              {post.location && <p className="text-[11px] text-gray-500 truncate">{post.location}</p>}
              <p className="text-[11px] text-gray-700 truncate">
                  {[post.courtType, post.area].filter(Boolean).join(' | ')}
              </p>
              {post.monthlyRent && <p className="text-[11px] font-semibold text-gray-600 truncate">월세 {post.monthlyRent}</p>}
          </>
      ) : isJobPosting ? (
          <>
              {post.location && <p className="text-[11px] text-gray-500 truncate">{post.location}</p>}
              {workingInfo && <p className="text-[11px] text-gray-700 truncate">{workingInfo}</p>}
          </>
      ) : isFreeBoard ? null : ( // Default for any other unforeseen category
          <>
              {post.location && <p className="text-[11px] text-gray-500 truncate">{post.location}</p>}
              {post.salary && <p className="text-[11px] font-semibold text-gray-600 truncate">{post.salary}</p>}
          </>
      )}
    </div>
  );


  return (
    <div
      onClick={() => onSelectPost(post)}
      className="flex-shrink-0 w-20 cursor-pointer group"
    >
      {hideImage ? (
        <div className="aspect-square w-full rounded-lg bg-gray-50 border border-gray-200 p-2 flex flex-col justify-center group-hover:border-[#ff5710] transition-colors">
            <TextContent />
        </div>
      ) : (
        <div className="space-y-2">
            <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
              {post.imageUrl ? (
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : post.category === Category.FREE_BOARD ? (
                <img src="https://i.imgur.com/cLToLpX.png" alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <DefaultPostIcon className="w-full h-full" />
              )}
            </div>
            <TextContent />
        </div>
      )}
    </div>
  );
};

export default PostCard;