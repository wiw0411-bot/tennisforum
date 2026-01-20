import React, { useState, useEffect, useCallback } from 'react';
import { Post, Comment, Category, User } from '../types';
import { CATEGORIES } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import DefaultPostIcon from './icons/DefaultPostIcon';
import { formatDays } from '../utills/formatDays';
import { formatSalary } from '../utills/formatSalary';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import ClockIcon from './icons/ClockIcon';
import WalletIcon from './icons/WalletIcon';
import CommentIcon from './icons/CommentIcon';
import TrashIcon from './icons/TrashIcon';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, Timestamp, doc, writeBatch, increment, deleteDoc } from 'firebase/firestore';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  currentUser: User | null;
  onDeletePost: (postId: string) => void;
  onEditPost?: (post: Post) => void;
  onRequestLogin: () => void;
  onPostUpdate: (updatedPost: Post) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, currentUser, onDeletePost, onEditPost, onRequestLogin, onPostUpdate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const categoryName = CATEGORIES.find(c => c.id === post.category)?.name;
  const workingDaysDisplay = formatDays(post.workingDays);
  
  const fetchComments = useCallback(async () => {
    if (!currentUser) {
      setComments([]);
      setIsLoadingComments(false);
      return;
    }
    
    try {
        setIsLoadingComments(true);
        const commentsRef = collection(db, `posts/${post.id}/comments`);
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedComments = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
            } as Comment;
        });
        setComments(fetchedComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
    } finally {
        setIsLoadingComments(false);
    }
  }, [post.id, currentUser]);

  useEffect(() => {
    if (post.commentsAllowed) {
        fetchComments();
    } else {
        setIsLoadingComments(false);
    }
  }, [post.commentsAllowed, fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) {
        onRequestLogin();
        return;
    }
    
    const commentData = {
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatarUrl,
      content: newComment,
      createdAt: serverTimestamp(),
    };
    
    try {
        const postRef = doc(db, 'posts', post.id);
        const newCommentRef = doc(collection(db, `posts/${post.id}/comments`));

        const batch = writeBatch(db);
        batch.set(newCommentRef, commentData);
        batch.update(postRef, { commentCount: increment(1) });
        await batch.commit();
        
        setNewComment('');
        
        const updatedPost = { ...post, commentCount: (post.commentCount || 0) + 1 };
        onPostUpdate(updatedPost);

        fetchComments(); // Re-fetch comments to show the new one
    } catch (error: any) {
        console.error("Error adding comment:", error);
        if (error.code === 'permission-denied') {
            alert("댓글을 등록할 권한이 없습니다. Firebase 데이터베이스 보안 규칙을 확인해주세요.");
        } else {
            alert("댓글 등록에 실패했습니다.");
        }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
      if (!currentUser || !window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
          return;
      }
      
      try {
          const postRef = doc(db, 'posts', post.id);
          const commentRef = doc(db, `posts/${post.id}/comments`, commentId);

          const batch = writeBatch(db);
          batch.delete(commentRef);
          batch.update(postRef, { commentCount: increment(-1) });
          await batch.commit();

          const updatedPost = { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) };
          onPostUpdate(updatedPost);
          
          fetchComments(); // Re-fetch
      } catch (error) {
          console.error("Error deleting comment:", error);
          alert("댓글 삭제에 실패했습니다.");
      }
  };

  const InfoPill: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-2 rounded-full">
      {icon}
      {children}
    </div>
  );
  
  const InfoTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-orange-100 text-[#ff5710] text-xs font-bold px-3 py-1 rounded-full">
      {children}
    </span>
  );

  const CoachInfoPill: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center text-sm py-2 border-b border-gray-100 last:border-b-0">
      <span className="font-semibold w-24 text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );

  const isJobPosting = post.category === Category.JOB_POSTING;
  const isJobSeeking = post.category === Category.JOB_SEEKING;
  const isCourtTransfer = post.category === Category.COURT_TRANSFER;

  return (
    <div className="bg-white h-full flex flex-col">
        <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
             <button
                onClick={onBack}
                className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
                aria-label="뒤로가기"
            >
                <ArrowLeftIcon />
            </button>
            <h1 className="text-lg font-bold text-gray-900 truncate px-12">{categoryName}</h1>
        </header>

        <div className="flex-grow overflow-y-auto hide-scrollbar">
          <main className="p-4 sm:p-6">
            <article>
              {/* Top Section with Edit/Delete buttons */}
              <div className="flex justify-between items-start">
                  <div>
                  <span className="inline-block bg-[#fde8de] text-[#a64415] text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                      {categoryName}
                  </span>
                  {post.category !== Category.FREE_BOARD && (
                      <p className="text-sm text-gray-500 mb-1">{post.location}</p>
                  )}
                  </div>
                  {currentUser && (currentUser.id === post.authorId || currentUser.role === 'admin') && (
                    <div className="flex space-x-2 text-xs text-gray-500 flex-shrink-0">
                        {currentUser.id === post.authorId && onEditPost && (
                            <>
                                <button onClick={() => onEditPost(post)} className="hover:text-gray-900">수정</button>
                                <span>|</span>
                            </>
                        )}
                        {(currentUser.id === post.authorId || currentUser.role === 'admin') && (
                            <button onClick={() => onDeletePost(post.id)} className="hover:text-red-600">삭제</button>
                        )}
                    </div>
                  )}
              </div>
              
              <h1 className="text-lg font-bold text-gray-900 my-4">
                {post.category === Category.FREE_BOARD && post.subCategory && (
                  <span className="text-[#ff5710] mr-2">[{post.subCategory}]</span>
                )}
                {post.title}
              </h1>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 border-b pb-4">
                <div className="flex items-center">
                  {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0" />
                  ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm mr-2 flex-shrink-0">
                      {post.author.substring(0,1)}
                      </div>
                  )}
                  <span className="font-semibold text-gray-800">{post.author}</span>
                </div>
                <div className="text-right">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="ml-4">조회수 {post.views}</span>
                </div>
              </div>
              
              {/* Representative Image */}
              {post.imageUrl ? (
                <img
                  className="w-full h-auto object-cover rounded-lg mb-6"
                  src={post.imageUrl}
                  alt={post.title}
                />
              ) : post.category === Category.FREE_BOARD ? (
                <img
                  className="w-full h-auto object-cover rounded-lg mb-6"
                  src="https://i.imgur.com/cLToLpX.png"
                  alt={post.title}
                />
              ) : (
                post.category !== Category.JOB_SEEKING && (
                  <DefaultPostIcon className="w-full h-auto object-cover rounded-lg mb-6" />
                )
              )}

              {(isJobPosting || isJobSeeking) && post.recruitmentField && (
                <div className="mb-6">
                  <InfoTag>{isJobPosting ? '구인분야' : '지원분야'}: {post.recruitmentField}</InfoTag>
                </div>
              )}
              
              {isJobSeeking && (
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 mb-3">코치 정보</h2>
                  <div className="space-y-1 rounded-lg border border-gray-200 p-4">
                    {post.field && <CoachInfoPill label="출신분야" value={post.field} />}
                    {post.playerCareer && <CoachInfoPill label="선수 경력" value={`${post.playerCareer}년`} />}
                    <CoachInfoPill 
                        label="레슨 경력" 
                        value={post.hasLessonCareer && post.lessonCareer ? `${post.lessonCareer}년 이상` : '없음'} 
                    />
                    {post.memberManagementSkill && <CoachInfoPill label="회원관리" value={post.memberManagementSkill} />}
                    {post.counselingSkill && <CoachInfoPill label="회원상담" value={post.counselingSkill} />}
                  </div>
                </div>
              )}

              {isCourtTransfer && (
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 mb-3">시설 정보</h2>
                  <div className="space-y-1 rounded-lg border border-gray-200 p-4">
                    {post.courtType && <CoachInfoPill label="시설 종류" value={post.courtType} />}
                    {post.area && <CoachInfoPill label="평수" value={post.area} />}
                    {post.monthlyRent && <CoachInfoPill label="월세" value={post.monthlyRent} />}
                    {post.maintenanceFee && <CoachInfoPill label="평균관리비" value={post.maintenanceFee} />}
                    {post.activeMembers && <CoachInfoPill label="유효회원수" value={post.activeMembers} />}
                    {post.averageRevenue && <CoachInfoPill label="월 평균매출" value={post.averageRevenue} />}
                    {post.fullCourtCount !== undefined && <CoachInfoPill label="풀코트" value={`${post.fullCourtCount}개`} />}
                    {post.halfCourtCount !== undefined && <CoachInfoPill label="하프코트" value={`${post.halfCourtCount}개`} />}
                    {post.ballMachineCount !== undefined && <CoachInfoPill label="볼머신기" value={`${post.ballMachineCount}개`} />}
                    {post.premium && <CoachInfoPill label="권리금/양도금액" value={post.premium} />}
                  </div>
                </div>
              )}

              {/* Info Pills Section */}
              {(isJobPosting || isJobSeeking) && (workingDaysDisplay || post.workingHours || post.salary) && (
                <>
                  <h2 className="text-base font-bold text-gray-800 mb-3">
                    {isJobPosting ? '근무 조건' : '희망 근무 조건'}
                  </h2>
                  <div className="flex flex-col items-start gap-3 mb-6">
                    {workingDaysDisplay && (
                      <InfoPill icon={<CalendarDaysIcon />}>
                        <span>{workingDaysDisplay}</span>
                      </InfoPill>
                    )}
                    {post.workingHours && (
                      <InfoPill icon={<ClockIcon />}>
                        <span>{post.workingHours}</span>
                      </InfoPill>
                    )}
                    {post.salary && (
                      <InfoPill icon={<WalletIcon />}>
                        <span className="font-semibold">{formatSalary(post.salary)}</span>
                      </InfoPill>
                    )}
                  </div>
                </>
              )}

              {/* Detailed Content & Images Section */}
              {(post.content && post.content.trim()) || (post.contentImages && post.contentImages.length > 0) ? (
                  <div className="mt-6 border-t pt-6 space-y-6">
                      {/* Main Content */}
                      {post.content && post.content.trim() && (
                          <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">
                              {post.content}
                          </div>
                      )}
                      
                      {/* Attached Content Images */}
                      {post.contentImages && post.contentImages.length > 0 && (
                          <div className="space-y-4">
                            {post.contentImages.map((img, index) => (
                              <img 
                                key={index} 
                                src={img} 
                                alt={`Content image ${index + 1}`} 
                                className="w-full h-auto object-cover rounded-lg" 
                              />
                            ))}
                          </div>
                      )}
                  </div>
              ) : null}
            </article>
          </main>

          {/* --- Comments Section --- */}
          <footer className="p-4 sm:p-6 border-t">
              {post.commentsAllowed ? (
                  <>
                  <div className="flex items-center text-gray-800 mb-4">
                      <CommentIcon />
                      <h2 className="text-base font-bold ml-2">댓글 {(post.commentCount || 0)}개</h2>
                  </div>
                  
                  {currentUser ? (
                    <>
                      <div className="space-y-2 divide-y divide-gray-100 mb-6">
                          {isLoadingComments ? (
                            <div className="text-center py-4 text-sm text-gray-500">댓글을 불러오는 중...</div>
                          ) : comments.length > 0 ? (
                            comments.map(comment => (
                              <div key={comment.id} className="pt-3 first:pt-0">
                                  <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-xs font-medium text-gray-800">{comment.author}</p>
                                            <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-xs mt-1 text-gray-700">{comment.content}</p>
                                    </div>
                                    {currentUser && (currentUser.id === comment.authorId || currentUser.id === post.authorId || currentUser.role === 'admin') && (
                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0">
                                            <TrashIcon />
                                        </button>
                                    )}
                                  </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-sm text-gray-500">등록된 댓글이 없습니다.</div>
                          )}
                      </div>

                      <form onSubmit={handleCommentSubmit} className="mt-6 flex items-start space-x-3">
                          <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 입력하세요..."
                          className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg px-4 py-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#ff5710] focus:border-transparent resize-none text-sm"
                          rows={2}
                          />
                          <button type="submit" className="px-4 py-2 bg-[#ff5710] text-white font-semibold rounded-lg hover:bg-[#e64e0e] transition-colors disabled:bg-[#ffc2aa] text-sm" disabled={!newComment.trim()}>
                          등록
                          </button>
                      </form>
                    </>
                  ) : (
                    <div className="mt-6 text-center p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600 mb-3">댓글을 보거나 작성하시려면 로그인이 필요합니다.</p>
                        <button onClick={onRequestLogin} className="px-6 py-2 bg-[#ff5710] text-white font-semibold rounded-lg hover:bg-[#e64e0e] transition-colors text-sm">
                        로그인
                        </button>
                    </div>
                  )}
                  </>
              ) : (
                  <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">댓글 작성이 불가능한 게시글입니다.</p>
                  </div>
              )}
          </footer>
        </div>
    </div>
  );
};

export default PostDetail;