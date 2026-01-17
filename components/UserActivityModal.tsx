import React from 'react';
import { User, Post } from '../types';
import XIcon from './icons/XIcon';

interface UserActivityModalProps {
  user: User;
  posts: Post[];
  onClose: () => void;
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({ user, posts, onClose }) => {
  const userPosts = posts.filter(p => p.authorId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const userComments: { postTitle: string; content: string; createdAt: string; }[] = [];
  posts.forEach(post => {
    post.comments?.forEach(comment => {
      if (comment.authorId === user.id) {
        userComments.push({
          postTitle: post.title,
          content: comment.content,
          createdAt: comment.createdAt,
        });
      }
    });
  });
  userComments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-3/4 flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="relative flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{user.name}님의 활동 내역</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-800"><XIcon /></button>
        </header>
        <main className="flex-grow overflow-y-auto p-4 space-y-6 bg-gray-50">
          <section>
            <h3 className="font-bold text-gray-800 mb-2">작성한 게시글 ({userPosts.length})</h3>
            <div className="bg-white rounded-lg border max-h-48 overflow-y-auto">
              {userPosts.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {userPosts.map(post => (
                    <li key={post.id} className="p-3 text-sm">
                      <p className="font-semibold text-gray-800 truncate">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">작성한 게시글이 없습니다.</p>
              )}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-gray-800 mb-2">작성한 댓글 ({userComments.length})</h3>
             <div className="bg-white rounded-lg border max-h-48 overflow-y-auto">
                {userComments.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                    {userComments.map((comment, index) => (
                    <li key={index} className="p-3 text-sm">
                        <p className="text-gray-800">"{comment.content}"</p>
                        <p className="text-xs text-gray-500 mt-1">
                            <span className="font-semibold">{'<'}{comment.postTitle}{'>'}</span> 게시물에 작성
                        </p>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-gray-500 text-center py-4">작성한 댓글이 없습니다.</p>
                )}
             </div>
          </section>
        </main>
        <footer className="p-4 bg-gray-100 border-t">
            <button onClick={onClose} className="w-full bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-black">닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default UserActivityModal;
