import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Post, Category, Comment, Announcement, User, Notification, NotificationType, Advertisement } from './types';
import { CATEGORIES } from './constants';
import Header from './components/Header';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
import PhoneVerificationScreen from './components/PhoneVerificationScreen';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import MyInfoScreen from './components/MyInfoScreen';
import MyActivityScreen from './components/MyActivityScreen';
import AdminPanel from './components/AdminPanel';
import AnnouncementsScreen from './components/AnnouncementsScreen';
import ProfileEditScreen from './components/ProfileEditScreen';
import SearchIcon from './components/icons/SearchIcon';
import ScheduleScreen from './components/ScheduleScreen';
import NotificationsListScreen from './components/NotificationsListScreen';
import SplashScreen from './components/SplashScreen';
import CreatePostButton from './components/CreatePostButton';
import HomeScreen from './components/HomeScreen';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';
import AdBanner from './components/AdBanner';
import { db, auth } from './firebase'; 
import { collection, getDocs, Timestamp, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut, User as FirebaseUser, deleteUser } from 'firebase/auth';


const MOCK_ADMIN: User = { id: 'admin001', name: '관리자', role: 'admin', createdAt: '2024-12-01T09:00:00Z' };

const handleFirestoreError = (error: any, context: string) => {
    console.error(`Firestore error (${context}):`, error);
    if (error.code === 'permission-denied') {
        alert(`데이터베이스 권한 오류가 발생했습니다. (${context})\n\nFirebase 콘솔에서 Firestore 데이터베이스의 '규칙(Rules)'이 올바르게 설정되었는지 확인해주세요.`);
    } else {
        alert(`오류가 발생했습니다. (${context})\n다시 시도해주세요.`);
    }
};

const App: React.FC = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'verifyPhone'>('login');
  const [userForVerification, setUserForVerification] = useState<{ user: FirebaseUser; phone: string } | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  
  // Data loading state
  const [isDataLoading, setIsDataLoading] = useState(true);

  const clearData = () => {
      setPosts([]);
      setAnnouncements([]);
      setAdvertisements([]);
      setUsers([]);
      setBookmarkedPostIds(new Set());
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (authView === 'verifyPhone') {
          setIsAuthLoading(false);
          return;
      }

      if (userAuth) {
        const userRef = doc(db, 'users', userAuth.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setCurrentUser({ id: snapshot.id, ...snapshot.data() } as User);
          setIsAuthenticated(true);
        } else {
          const { displayName, email, photoURL } = userAuth;
          const newUser: Omit<User, 'id'> = {
            name: displayName || email?.split('@')[0] || '새 사용자',
            avatarUrl: photoURL || undefined,
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(userRef, newUser);
            setCurrentUser({ id: userAuth.uid, ...newUser });
            setIsAuthenticated(true);
          } catch (error) {
             handleFirestoreError(error, "소셜 로그인 사용자 프로필 생성");
             setCurrentUser(null);
             setIsAuthenticated(false);
          }
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearData(); // Clear data on logout
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [authView]);

  useEffect(() => {
    const fetchAllData = async () => {
        if (!currentUser) return; // Only fetch if user is logged in

        setIsDataLoading(true);
        try {
            const [usersSnapshot, postsSnapshot, announcementsSnapshot, advertisementsSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'posts')),
                getDocs(collection(db, 'announcements')),
                getDocs(collection(db, 'advertisements')),
            ]);

            const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(userList);

            const postList = postsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt 
                } as Post;
            });
            setPosts(postList);

            const announcementList = announcementsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt 
                } as Announcement;
            });
            setAnnouncements(announcementList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

            const adList = advertisementsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt 
                } as Advertisement;
            });
            setAdvertisements(adList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        } catch (error) {
            handleFirestoreError(error, "데이터 로딩");
        } finally {
            setIsDataLoading(false);
        }
    };
    
    if (currentUser) {
      fetchAllData();
    } else {
      setIsDataLoading(false);
    }
  }, [currentUser]);


  const handleSignUpSuccess = (user: FirebaseUser, phone: string) => {
    setUserForVerification({ user, phone });
    setAuthView('verifyPhone');
  };

  const handleVerificationSuccess = async () => {
    if (!userForVerification) return;
    const userRef = doc(db, 'users', userForVerification.user.uid);
    try {
        await updateDoc(userRef, { phoneVerified: true });
        const snapshot = await getDoc(userRef);
        if(snapshot.exists()){
            setCurrentUser({ id: snapshot.id, ...snapshot.data() } as User);
            setIsAuthenticated(true);
        }
        setAuthView('login');
        setUserForVerification(null);
    } catch(error) {
        handleFirestoreError(error, "휴대폰 인증 상태 업데이트");
    }
  };

  const handleVerificationCancel = async () => {
    if (userForVerification) {
        try {
            await deleteUser(userForVerification.user);
        } catch (error) {
            console.error("Failed to delete unverified user", error);
            await signOut(auth);
        }
    }
    setAuthView('login');
    setUserForVerification(null);
  };

  const [viewingPrivacyPolicy, setViewingPrivacyPolicy] = useState(false);
  const [viewingTerms, setViewingTerms] = useState(false);
  const [viewingAnnouncements, setViewingAnnouncements] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
        setBookmarkedPostIds(new Set());
        return;
    };

    const fetchBookmarks = async () => {
        try {
            const bookmarksSnapshot = await getDocs(collection(db, `user_activities/${currentUser.id}/bookmarks`));
            const ids = new Set(bookmarksSnapshot.docs.map(doc => doc.id));
            setBookmarkedPostIds(ids);
        } catch (error) {
            handleFirestoreError(error, "북마크 정보 로딩");
        }
    };
    fetchBookmarks();
  }, [currentUser]);

  const postsWithBookmarks = useMemo(() => {
      return posts.map(post => ({
          ...post,
          isBookmarked: bookmarkedPostIds.has(post.id)
      }));
  }, [posts, bookmarkedPostIds]);


  const [activeCategory, setActiveCategory] = useState<Category>(Category.JOB_POSTING);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'notifications' | 'myInfo'>('home');
  const [currentScreen, setCurrentScreen] = useState<'list' | 'myInfo' | 'myPosts' | 'myBookmarks'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [homeView, setHomeView] = useState<'dashboard' | 'board'>('dashboard');
  
  const handleSplashFinish = useCallback(() => {
    setShowSplashScreen(false);
  }, []);

  const handleSetActiveCategory = useCallback((category: Category) => {
    setActiveCategory(category);
  }, []);

  const postsByCategory = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    const grouped: { [key: string]: Post[] } = {};
    CATEGORIES.forEach(cat => {
      grouped[cat.id] = postsWithBookmarks
        .filter(post => post.category === cat.id)
        .filter(
          post =>
            lowercasedQuery === '' ||
            post.title.toLowerCase().includes(lowercasedQuery) ||
            post.author.toLowerCase().includes(lowercasedQuery)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    return grouped;
  }, [postsWithBookmarks, searchQuery]);
  
  const myPosts = useMemo(() => postsWithBookmarks.filter(p => currentUser && p.authorId === currentUser.id), [postsWithBookmarks, currentUser]);
  const bookmarkedPosts = useMemo(() => postsWithBookmarks.filter(p => p.isBookmarked), [postsWithBookmarks]);

  const handleAdminLogin = useCallback(() => {
    setIsAdminView(true);
    setCurrentUser(MOCK_ADMIN);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(async () => {
    if (isAdminView) {
        setIsAdminView(false);
        setCurrentUser(null);
        setIsAuthenticated(false);
    } else {
        await signOut(auth);
    }
    setActiveTab('home');
    setHomeView('dashboard');
    setCurrentScreen('list');
  }, [isAdminView]);

  const handleShowPrivacyPolicy = useCallback(() => setViewingPrivacyPolicy(true), []);
  const handleHidePrivacyPolicy = useCallback(() => setViewingPrivacyPolicy(false), []);
  const handleShowTerms = useCallback(() => setViewingTerms(true), []);
  const handleHideTerms = useCallback(() => setViewingTerms(false), []);
  const handleShowAnnouncements = useCallback(() => setViewingAnnouncements(true), []);
  const handleHideAnnouncements = useCallback(() => setViewingAnnouncements(false), []);
  const handleShowProfileEdit = useCallback(() => setIsEditingProfile(true), []);
  const handleHideProfileEdit = useCallback(() => setIsEditingProfile(false), []);

  const handleUpdateProfile = useCallback(async (profileData: { name: string; avatarUrl: string | undefined }) => {
    if (!currentUser) return;
    const { name, avatarUrl } = profileData;
    const userId = currentUser.id;

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { name, avatarUrl });

        setCurrentUser(prev => prev ? { ...prev, name, avatarUrl } : null);
        setIsEditingProfile(false);
    } catch (error) {
        handleFirestoreError(error, "프로필 업데이트");
    }
  }, [currentUser]);

  const handleSelectPost = useCallback((postToSelect: Post) => {
    try {
        const postRef = doc(db, 'posts', postToSelect.id);
        updateDoc(postRef, { views: (postToSelect.views || 0) + 1 });
        
        const updatedPost = { ...postToSelect, views: (postToSelect.views || 0) + 1 };
        setPosts(prevPosts => prevPosts.map(p => p.id === postToSelect.id ? updatedPost : p));
        setSelectedPost(updatedPost);
        setIsCreatingPost(false);
        setEditingPost(null);
    } catch (error) {
        handleFirestoreError(error, "조회수 업데이트");
        setSelectedPost(postToSelect);
        setIsCreatingPost(false);
        setEditingPost(null);
    }
  }, []);
  
  const handleToggleBookmark = useCallback(async (postId: string) => {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    const newBookmarkedIds = new Set(bookmarkedPostIds);
    const bookmarkRef = doc(db, `user_activities/${currentUser.id}/bookmarks`, postId);
    
    try {
        if (newBookmarkedIds.has(postId)) {
            newBookmarkedIds.delete(postId);
            await deleteDoc(bookmarkRef);
        } else {
            newBookmarkedIds.add(postId);
            await setDoc(bookmarkRef, {});
        }
        setBookmarkedPostIds(newBookmarkedIds);
    } catch (error) {
        handleFirestoreError(error, "북마크 변경");
    }
  }, [currentUser, bookmarkedPostIds]);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;
  
    const canDelete = currentUser && (currentUser.id === postToDelete.authorId || currentUser.role === 'admin');
    
    if (canDelete) {
      if (window.confirm('정말로 이 게시물을 삭제하시겠습니까? 데이터베이스에서 영구적으로 삭제됩니다.')) {
          setPosts(prev => prev.filter(p => p.id !== postId));
          setSelectedPost(null);
          setEditingPost(null);
          
          try {
              const postRef = doc(db, 'posts', postId);
              await deleteDoc(postRef);
          } catch (error) {
              setPosts(prev => [...prev, postToDelete].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
              handleFirestoreError(error, "게시물 삭제");
          }
      }
    } else {
      alert('이 게시물을 삭제할 권한이 없습니다.');
    }
  }, [posts, currentUser]);


  const handleCreateAnnouncement = useCallback(async (newAnnouncement: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
        const dataToSave = { ...newAnnouncement, createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'announcements'), dataToSave);
        
        const announcementToAdd: Announcement = {
            id: docRef.id,
            ...newAnnouncement,
            createdAt: new Date().toISOString(),
        };
        setAnnouncements(prev => [announcementToAdd, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
        handleFirestoreError(error, "공지사항 등록");
    }
  }, []);

  const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        const originalAnnouncements = announcements;
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        try {
            await deleteDoc(doc(db, 'announcements', announcementId));
        } catch (error) {
            setAnnouncements(originalAnnouncements);
            handleFirestoreError(error, "공지사항 삭제");
        }
    }
  }, [announcements]);
  
  const handleCreateAdvertisement = useCallback(async (newAdData: Omit<Advertisement, 'id' | 'createdAt' | 'isActive'>) => {
    try {
        const dataToSave = {
            ...newAdData,
            isActive: true,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'advertisements'), dataToSave);
        const adToAdd: Advertisement = {
            id: docRef.id,
            ...newAdData,
            isActive: true,
            createdAt: new Date().toISOString(),
        };
        setAdvertisements(prev => [adToAdd, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
        handleFirestoreError(error, "광고 등록");
    }
  }, []);

  const handleUpdateAdvertisement = useCallback(async (adId: string, updates: Partial<Pick<Advertisement, 'isActive' | 'linkUrl'>>) => {
      const originalAdvertisements = advertisements;
      setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, ...updates } : ad));
      try {
          await updateDoc(doc(db, 'advertisements', adId), updates);
      } catch (error) {
          setAdvertisements(originalAdvertisements);
          handleFirestoreError(error, "광고 업데이트");
      }
  }, [advertisements]);

  const handleDeleteAdvertisement = useCallback(async (adId: string) => {
      if (window.confirm('정말로 이 광고를 삭제하시겠습니까?')) {
          const originalAdvertisements = advertisements;
          setAdvertisements(prev => prev.filter(ad => ad.id !== adId));
          try {
              await deleteDoc(doc(db, 'advertisements', adId));
          } catch (error) {
              setAdvertisements(originalAdvertisements);
              handleFirestoreError(error, "광고 삭제");
          }
      }
  }, [advertisements]);

  const handleBackToList = useCallback(() => {
      setSelectedPost(null);
      setEditingPost(null);
  }, []);
  
  const handleShowCreateForm = useCallback(() => {
    setSelectedPost(null);
    setEditingPost(null);
    setActiveTab('home');
    setIsCreatingPost(true);
  }, []);

  const handleCancelCreate = useCallback(() => setIsCreatingPost(false), []);

  const handleCreatePost = useCallback(async (newPostData: Omit<Post, 'id' | 'createdAt' | 'views'>) => {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        return;
    }

    const dataToSave = {
      ...newPostData,
      authorId: currentUser.id,
      author: newPostData.category === Category.JOB_SEEKING ? currentUser.name : newPostData.title,
      authorAvatar: currentUser.avatarUrl,
      views: 0,
      createdAt: serverTimestamp(),
    };

    try {
      const postsCollection = collection(db, 'posts');
      const docRef = await addDoc(postsCollection, dataToSave as { [x: string]: any });

      const postToAdd: Post = {
        id: docRef.id,
        ...newPostData,
        authorId: currentUser.id,
        author: newPostData.category === Category.JOB_SEEKING ? currentUser.name : newPostData.title,
        authorAvatar: currentUser.avatarUrl,
        views: 0,
        createdAt: new Date().toISOString(),
      };

      setPosts(prevPosts => [postToAdd, ...prevPosts]);
      setIsCreatingPost(false);
      setActiveCategory(newPostData.category);

    } catch (error) {
        handleFirestoreError(error, "게시물 등록");
    }
  }, [currentUser]);

  const handleShowEditForm = useCallback((postToEdit: Post) => {
      setSelectedPost(null);
      setIsCreatingPost(false);
      setEditingPost(postToEdit);
  }, []);

  const handleCancelEdit = useCallback(() => {
      setEditingPost(null);
  }, []);

  const handleUpdatePost = useCallback(async (updatedPostData: Omit<Post, 'id' | 'createdAt' | 'views'>) => {
    if (!editingPost) return;

    const postRef = doc(db, 'posts', editingPost.id);
    try {
        await updateDoc(postRef, updatedPostData as { [x: string]: any });

        const updatedPost = { ...editingPost, ...updatedPostData };
        setPosts(prevPosts => prevPosts.map(p => p.id === editingPost.id ? updatedPost : p));
        setEditingPost(null);
        handleSelectPost(updatedPost); 
    } catch (error) {
        handleFirestoreError(error, "게시물 수정");
    }
  }, [editingPost, handleSelectPost]);
  
  const handleTabChange = useCallback((tab: 'home' | 'schedule' | 'notifications' | 'myInfo') => {
    setSelectedPost(null);
    setIsCreatingPost(false);
    setEditingPost(null);
    
    if (activeTab === 'home' && tab !== 'home') {
        setHomeView('dashboard'); 
    }
    
    setActiveTab(tab);

    if(tab === 'myInfo') {
        setCurrentScreen('myInfo');
    } else {
        setCurrentScreen('list');
    }
  }, [activeTab]);
  
  const handleShowMyPosts = useCallback(() => setCurrentScreen('myPosts'), []);
  const handleShowMyBookmarks = useCallback(() => setCurrentScreen('myBookmarks'), []);
  const handleBackToMyInfo = useCallback(() => setCurrentScreen('myInfo'), []);

  const handleNavigateToBoard = useCallback((category: Category) => {
    setActiveCategory(category);
    setHomeView('board');
    setSearchQuery(''); 
  }, []);

  const handleBackToDashboard = useCallback(() => {
      setHomeView('dashboard');
      setSearchQuery(''); 
  }, []);


  const renderContent = () => {
    if (isDataLoading) {
       return <div className="flex h-full items-center justify-center"><p>데이터를 불러오는 중...</p></div>;
    }
    if (selectedPost) {
      return <PostDetail post={selectedPost} onBack={handleBackToList} currentUser={currentUser} onDeletePost={handleDeletePost} onEditPost={handleShowEditForm} />;
    }
    if (editingPost) {
      return <PostForm 
        onSubmit={handleUpdatePost} 
        onCancel={handleCancelEdit} 
        activeCategory={editingPost.category}
        postToEdit={editingPost}
      />;
    }
    if (isCreatingPost) {
      return <PostForm onSubmit={handleCreatePost} onCancel={handleCancelCreate} activeCategory={activeCategory} />;
    }

    const mainContent = () => {
        switch (activeTab) {
            case 'schedule':
                return <ScheduleScreen currentUser={currentUser} />;
            case 'notifications':
                return <NotificationsListScreen />;
            case 'myInfo':
                 switch (currentScreen) {
                    case 'myInfo':
                        return <MyInfoScreen currentUser={currentUser} onLogout={handleLogout} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTerms={handleShowTerms} onShowMyPosts={handleShowMyPosts} onShowMyBookmarks={handleShowMyBookmarks} onShowAnnouncements={handleShowAnnouncements} onShowProfileEdit={handleShowProfileEdit} />;
                    case 'myPosts':
                        return <MyActivityScreen title="내가 쓴 글" posts={myPosts} onBack={handleBackToMyInfo} onSelectPost={handleSelectPost} onToggleBookmark={handleToggleBookmark} />;
                    case 'myBookmarks':
                        return <MyActivityScreen title="관심 목록 (스크랩)" posts={bookmarkedPosts} onBack={handleBackToMyInfo} onSelectPost={handleSelectPost} onToggleBookmark={handleToggleBookmark} />;
                    default:
                        return null;
                }
            case 'home':
            default:
                if (homeView === 'dashboard') {
                    return (
                        <HomeScreen 
                            posts={postsWithBookmarks}
                            announcements={announcements}
                            advertisements={advertisements}
                            onNavigateToBoard={handleNavigateToBoard}
                            onSelectPost={handleSelectPost}
                            onToggleBookmark={handleToggleBookmark}
                            onShowAnnouncements={handleShowAnnouncements}
                        />
                    );
                }

                const categoryIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
                const categoryTitle = CATEGORIES.find(c => c.id === activeCategory)?.title || '게시판';

                return (
                    <div className="h-full flex flex-col">
                        <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
                            <button
                                onClick={handleBackToDashboard}
                                className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
                                aria-label="뒤로가기"
                            >
                                <ArrowLeftIcon />
                            </button>
                            <h1 className="text-lg font-bold text-gray-900">{categoryTitle}</h1>
                        </header>
                        <div className="flex-shrink-0 bg-white px-4 pt-4">
                            <AdBanner advertisements={advertisements} />
                        </div>
                        <Header 
                            activeCategory={activeCategory}
                            setActiveCategory={handleSetActiveCategory}
                        />
                        <main className="flex-grow flex flex-col min-h-0">
                           <div className="px-4 pt-4 flex-shrink-0">
                             <div className="relative my-3">
                                <input 
                                    type="text"
                                    placeholder="제목, 작성자 검색"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] placeholder-gray-500 text-gray-800"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-400" />
                                </div>
                             </div>
                           </div>
                           <div className="flex-grow overflow-hidden">
                                <div 
                                    className="h-full flex transition-transform duration-300 ease-in-out"
                                    style={{ transform: `translateX(-${categoryIndex * 100}%)` }}
                                >
                                    {CATEGORIES.map(category => (
                                        <div key={category.id} className="w-full flex-shrink-0 h-full overflow-y-auto hide-scrollbar px-4 pb-20">
                                            {(postsByCategory[category.id] || []).length > 0 ? (
                                              <PostList 
                                                  posts={postsByCategory[category.id] || []}
                                                  onSelectPost={handleSelectPost}
                                                  onToggleBookmark={handleToggleBookmark}
                                              />
                                            ) : (
                                              <div className="text-center py-16">
                                                <p className="text-gray-500 text-sm">
                                                  {searchQuery ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                                                </p>
                                              </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                           </div>
                        </main>
                    </div>
                );
        }
    }

    return (
        <>
            {mainContent()}
            {isAuthenticated && activeTab === 'home' && homeView === 'board' && !isCreatingPost && !selectedPost && <CreatePostButton onClick={handleShowCreateForm} />}
            <BottomNav 
                activeTab={activeTab} 
                onTabChange={handleTabChange}
            />
        </>
    )
  };

  if (showSplashScreen) {
    return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><SplashScreen onFinish={handleSplashFinish} /></div>;
  }
  if (viewingPrivacyPolicy) {
    return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><PrivacyPolicy onBack={handleHidePrivacyPolicy} /></div>;
  }
  if (viewingTerms) {
    return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><TermsOfService onBack={handleHideTerms} /></div>;
  }
  if (viewingAnnouncements) {
    return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><AnnouncementsScreen onBack={handleHideAnnouncements} announcements={announcements} /></div>;
  }
  if (isEditingProfile && currentUser) {
      return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><ProfileEditScreen currentUser={currentUser} onBack={handleHideProfileEdit} onSave={handleUpdateProfile} /></div>;
  }

  if (isAuthLoading) {
     return <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative"><div className="flex h-full items-center justify-center"><p>인증 정보를 확인하는 중...</p></div></div>;
  }
  
  if (!isAuthenticated) {
    if (authView === 'verifyPhone' && userForVerification) {
      return <PhoneVerificationScreen phone={userForVerification.phone} onVerify={handleVerificationSuccess} onBack={handleVerificationCancel} />;
    }
    return <LoginScreen onAdminLogin={handleAdminLogin} onSignUpSuccess={handleSignUpSuccess} onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTerms={handleShowTerms} />;
  }
  
  if (isAdminView) {
      return <AdminPanel 
                currentUser={currentUser} 
                users={users} 
                posts={posts} 
                announcements={announcements} 
                advertisements={advertisements}
                onLogout={handleLogout} 
                onDeletePost={handleDeletePost} 
                onCreateAnnouncement={handleCreateAnnouncement} 
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onCreateAdvertisement={handleCreateAdvertisement}
                onUpdateAdvertisement={handleUpdateAdvertisement}
                onDeleteAdvertisement={handleDeleteAdvertisement}
             />;
  }

  return (
    <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative">
      {renderContent()}
    </div>
  );
};

export default App;