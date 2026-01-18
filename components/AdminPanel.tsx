

import React, { useState, useMemo, useRef } from 'react';
import { Post, Announcement, User, Advertisement } from '../types';
import PowerIcon from './icons/PowerIcon';
import ImageIcon from './icons/ImageIcon';
import UserActivityModal from './UserActivityModal';
import TrashIcon from './icons/TrashIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import PostDetail from './PostDetail';

interface AdminPanelProps {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  announcements: Announcement[];
  advertisements: Advertisement[];
  onLogout: () => void;
  onDeletePost: (postId: string) => void;
  onCreateAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
  onCreateAdvertisement: (ad: Omit<Advertisement, 'id' | 'createdAt' | 'isActive'>) => void;
  onUpdateAdvertisement: (adId: string, updates: Partial<Pick<Advertisement, 'isActive' | 'linkUrl'>>) => void;
  onDeleteAdvertisement: (adId: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
);


const Statistics: React.FC<{ users: User[]; posts: Post[]; }> = ({ users, posts }) => {
    const totalViews = useMemo(() => posts.reduce((sum, post) => sum + post.views, 0), [posts]);
    const totalComments = useMemo(() => posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0), [posts]);

    const userStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0,0,0,0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let todaySignups = 0;
        let weekSignups = 0;
        let monthSignups = 0;
        const dailySignups: { [key: string]: number } = {};

        users.forEach(user => {
            if(!user.createdAt) return;
            const createdAt = new Date(user.createdAt);
            
            if (createdAt >= today) {
                todaySignups++;
            }
            if (createdAt >= oneWeekAgo) {
                weekSignups++;
            }
            if (createdAt >= startOfMonth) {
                monthSignups++;
            }

            const dateKey = createdAt.toISOString().split('T')[0];
            dailySignups[dateKey] = (dailySignups[dateKey] || 0) + 1;
        });

        const sortedDailySignups = Object.entries(dailySignups)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .slice(0, 15)
            .reverse();

        return {
            totalUsers: users.length,
            todaySignups,
            weekSignups,
            monthSignups,
            dailySignups: sortedDailySignups,
        };
    }, [users]);

    const maxDailySignup = useMemo(() => {
        if (userStats.dailySignups.length === 0) return 1;
        return Math.max(...userStats.dailySignups.map(([, count]) => count), 1);
    }, [userStats.dailySignups]);


    return (
        <div className="p-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">게시물 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="총 게시물" value={`${posts.length}개`} />
                    <StatCard title="총 조회수" value={`${totalViews.toLocaleString()}회`} />
                    <StatCard title="총 댓글" value={`${totalComments.toLocaleString()}개`} />
                </div>
            </div>
             <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">사용자 유입 분석</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="총 사용자" value={`${userStats.totalUsers}명`} />
                    <StatCard title="오늘 가입" value={`${userStats.todaySignups}명`} />
                    <StatCard title="이번 주 가입" value={`${userStats.weekSignups}명`} />
                    <StatCard title="이번 달 가입" value={`${userStats.monthSignups}명`} />
                </div>
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h4 className="text-md font-bold text-gray-700 mb-4">일자별 가입 현황 (최근 15일)</h4>
                    {userStats.dailySignups.length > 0 ? (
                        <div className="flex items-end space-x-2 h-40 overflow-x-auto pb-4">
                            {userStats.dailySignups.map(([date, count]) => {
                                const barHeight = (count / maxDailySignup) * 100;
                                const [, , day] = date.split('-');
                                return (
                                    <div key={date} className="flex flex-col items-center flex-shrink-0 w-10" title={`${date}: ${count}명`}>
                                        <div className="text-xs font-bold text-gray-700">{count}</div>
                                        <div className="w-4 bg-[#ffc2aa] rounded-t-sm hover:bg-[#ff5710] transition-colors" style={{ height: `${barHeight}%` }}></div>
                                        <div className="text-xs text-gray-500 mt-1">{`${day}일`}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">가입자 데이터가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC<{ users: User[]; posts: Post[]; }> = ({ users, posts }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const sortedUsers = useMemo(() => 
        [...users].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [users]);

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">사용자 목록 ({users.length}명)</h3>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">이름</th>
                                <th scope="col" className="px-6 py-3">역할</th>
                                <th scope="col" className="px-6 py-3">가입일</th>
                                <th scope="col" className="px-6 py-3">활동내역</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center">
                                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" /> : <UserCircleIcon className="w-8 h-8 text-gray-400 mr-3" />}
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedUser(user)} className="font-medium text-[#ff5710] hover:underline">보기</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedUser && <UserActivityModal user={selectedUser} posts={posts} onClose={() => setSelectedUser(null)} />}
        </div>
    );
};

const PostManagement: React.FC<{ posts: Post[]; onDeletePost: (postId: string) => void; onSelectPost: (post: Post) => void; }> = ({ posts, onDeletePost, onSelectPost }) => {
     const sortedPosts = useMemo(() => 
        [...posts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [posts]);

    return (
        <div className="p-4">
             <h3 className="text-xl font-bold text-gray-800 mb-4">게시물 관리 ({posts.length}개)</h3>
             <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {sortedPosts.map(post => (
                        <li key={post.id} className="flex justify-between items-center">
                            <div className="flex-grow cursor-pointer p-4 hover:bg-gray-50" onClick={() => onSelectPost(post)}>
                                <p className="font-semibold text-gray-800">{post.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{post.author} · {new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => onDeletePost(post.id)} className="text-red-500 hover:text-red-700 p-4 flex-shrink-0 hover:bg-red-50">
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const AnnouncementManagement: React.FC<{ announcements: Announcement[], onCreateAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void, onDeleteAnnouncement: (announcementId: string) => void }> = ({ announcements, onCreateAnnouncement, onDeleteAnnouncement }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        const announcementData: Omit<Announcement, 'id' | 'createdAt'> = { title, content };
        if (imageUrl) {
          announcementData.imageUrl = imageUrl;
        }
        onCreateAnnouncement(announcementData);
        setTitle('');
        setContent('');
        setImageUrl('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const sortedAnnouncements = useMemo(() => 
        [...announcements].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [announcements]);

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">공지사항 관리</h3>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-[#ff5710] focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"/>
                    <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-[#ff5710] focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"></textarea>
                    
                    <div className="flex items-center space-x-4">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            이미지 첨부
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        {imageUrl && <span className="text-xs text-gray-500">이미지가 첨부되었습니다.</span>}
                    </div>

                    <button type="submit" className="w-full bg-[#ff5710] text-white font-bold py-2 rounded-md hover:bg-[#e64e0e]">공지 등록</button>
                </form>
            </div>

            <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-700 mb-2">등록된 공지사항</h4>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {sortedAnnouncements.map(ann => (
                            <li key={ann.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold text-gray-800">{ann.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => onDeleteAnnouncement(ann.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const AdManagement: React.FC<{
  advertisements: Advertisement[];
  onCreateAdvertisement: (ad: Omit<Advertisement, 'id' | 'createdAt' | 'isActive'>) => void;
  onUpdateAdvertisement: (adId: string, updates: Partial<Pick<Advertisement, 'isActive' | 'linkUrl'>>) => void;
  onDeleteAdvertisement: (adId: string) => void;
}> = ({ advertisements, onCreateAdvertisement, onUpdateAdvertisement, onDeleteAdvertisement }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      alert('이미지 URL을 입력해주세요.');
      return;
    }
    onCreateAdvertisement({ imageUrl: newImageUrl, linkUrl: newLinkUrl });
    setNewImageUrl('');
    setNewLinkUrl('');
  };

  const sortedAds = useMemo(() =>
    [...advertisements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [advertisements]);
  
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">광고 관리</h3>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label htmlFor="ad-image-url" className="text-sm font-medium text-gray-700">이미지 URL</label>
              <input id="ad-image-url" type="text" placeholder="https://example.com/image.png" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="mt-1 w-full bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-[#ff5710] focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"/>
           </div>
           <div>
              <label htmlFor="ad-link-url" className="text-sm font-medium text-gray-700">연결 링크 (선택사항)</label>
              <input id="ad-link-url" type="text" placeholder="https://example.com/promotion" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="mt-1 w-full bg-gray-100 border-gray-300 rounded-md shadow-sm focus:border-[#ff5710] focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"/>
           </div>
          <button type="submit" className="w-full bg-[#ff5710] text-white font-bold py-2 rounded-md hover:bg-[#e64e0e]">새 광고 등록</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <h4 className="text-lg font-bold text-gray-700 p-4 border-b">등록된 광고 목록</h4>
        <ul className="divide-y divide-gray-200">
          {sortedAds.map(ad => (
            <li key={ad.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <img src={ad.imageUrl} alt="광고 미리보기" className="w-24 h-16 object-cover rounded-md border bg-gray-100" />
                <div className="text-sm min-w-0">
                  <p className="text-gray-500 break-all"><b>링크:</b> {ad.linkUrl || '없음'}</p>
                  <p className="text-xs text-gray-400 mt-1"><b>등록일:</b> {new Date(ad.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 self-end sm:self-center">
                <label className="flex items-center cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 mr-2">활성화</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={ad.isActive}
                      onChange={(e) => onUpdateAdvertisement(ad.id, { isActive: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff5710]"></div>
                  </div>
                </label>
                <button onClick={() => onDeleteAdvertisement(ad.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}


const AdminPanel: React.FC<AdminPanelProps> = ({ 
    currentUser, users, posts, announcements, advertisements, onLogout, onDeletePost, 
    onCreateAnnouncement, onDeleteAnnouncement,
    onCreateAdvertisement, onUpdateAdvertisement, onDeleteAdvertisement
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'posts' | 'announcements' | 'ads'>('stats');
  const [viewingPost, setViewingPost] = useState<Post | null>(null);

  const handleSelectPost = (post: Post) => setViewingPost(post);
  const handleBackFromPost = () => setViewingPost(null);

  const handleDeletePostInDetail = (postId: string) => {
    onDeletePost(postId);
    setViewingPost(null);
  };
  
  if (viewingPost) {
    return (
      <div className="h-full flex flex-col bg-gray-100">
        <PostDetail
            post={viewingPost}
            onBack={handleBackFromPost}
            currentUser={currentUser}
            onDeletePost={handleDeletePostInDetail}
        />
      </div>
    );
  }
  
  const NavButton: React.FC<{ label: string; tab: typeof activeTab; }> = ({ label, tab }) => {
      const isActive = activeTab === tab;
      return (
        <button 
            onClick={() => setActiveTab(tab)} 
            className={`py-3 px-2 text-sm font-medium transition-colors ${isActive ? 'border-b-2 border-[#ff5710] text-[#ff5710]' : 'text-gray-500 hover:text-[#ff5710]'}`}
        >
            {label}
        </button>
      )
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center flex-shrink-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">관리자 패널</h1>
        <button onClick={onLogout} className="flex items-center text-sm font-medium text-gray-600 hover:text-[#ff5710]">
          <PowerIcon />
          <span className="ml-1">로그아웃</span>
        </button>
      </header>

      <nav className="bg-white border-b flex-shrink-0">
          <ul className="flex justify-center space-x-2 px-4 overflow-x-auto hide-scrollbar">
            <li><NavButton label="통계" tab="stats" /></li>
            <li><NavButton label="사용자 관리" tab="users" /></li>
            <li><NavButton label="게시물 관리" tab="posts" /></li>
            <li><NavButton label="공지사항 관리" tab="announcements" /></li>
            <li><NavButton label="광고 관리" tab="ads" /></li>
          </ul>
      </nav>

      <main className="flex-grow overflow-y-auto hide-scrollbar">
        {activeTab === 'stats' && <Statistics users={users} posts={posts} />}
        {activeTab === 'users' && <UserManagement users={users} posts={posts} />}
        {activeTab === 'posts' && <PostManagement posts={posts} onDeletePost={onDeletePost} onSelectPost={handleSelectPost} />}
        {activeTab === 'announcements' && <AnnouncementManagement announcements={announcements} onCreateAnnouncement={onCreateAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} />}
        {activeTab === 'ads' && <AdManagement advertisements={advertisements} onCreateAdvertisement={onCreateAdvertisement} onUpdateAdvertisement={onUpdateAdvertisement} onDeleteAdvertisement={onDeleteAdvertisement} />}
      </main>
    </div>
  );
};

export default AdminPanel;