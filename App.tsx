


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Post, Category, Comment, Announcement, User, Notification, NotificationType, Advertisement } from './types';
import { CATEGORIES } from './constants';
import Header from './components/Header';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostForm from './components/PostForm';
import BottomNav from './components/BottomNav';
import LoginScreen from './components/LoginScreen';
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
import EmailVerificationScreen from './components/EmailVerificationScreen';
import { db, auth } from './firebase'; 
// FIX: The project seems to be using Firebase v8 SDK.
// Removed v9 modular imports and will use v8 namespaced API.
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const { Timestamp } = firebase.firestore;
const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
type FirebaseUser = firebase.User;


const ADMIN_EMAIL = 'wnxogud12@naver.com';

const handleFirestoreError = (error: any, context: string) => {
    console.error(`Firestore error (${context}):`, error);
    if (error.code === 'permission-denied') {
        alert(`데이터베이스 권한 오류가 발생했습니다. (${context})\n\nFirebase 콘솔에서 Firestore 데이터베이스의 '규칙(Rules)'이 올바르게 설정되었는지 확인해주세요.`);
    } else {
        alert(`오류가 발생했습니다. (${context})\n다시 시도해주세요.`);
    }
};

const seedInitialData = async () => {
    // FIX: Use v8 batch syntax
    const batch = db.batch();
    let needsCommit = false;

    try {
        // FIX: Use v8 collection/get syntax
        const postsRef = db.collection('posts');
        const postsSnapshot = await postsRef.get();
        if (postsSnapshot.empty) {
            console.log("Seeding initial posts...");
            needsCommit = true;
            
            // FIX: Use v8 doc syntax
            const jobPostingRef = postsRef.doc();
            batch.set(jobPostingRef, {
                author: '서울테니스클럽', authorId: 'admin_seed', category: Category.JOB_POSTING, location: '서울특별시 강남구', title: '서울테니스클럽',
                recruitmentField: '테니스', workingType: '풀타임', workingHours: '09:00 ~ 18:00', workingDays: ['월', '화', '수', '목', '금'],
                salary: '월급 350만원', content: '경력 3년 이상 코치님을 모집합니다. 자세한 내용은 문의 바랍니다.', imageUrl: 'https://i.imgur.com/K2H1KaY.png',
                // FIX: Use v8 serverTimestamp
                views: 120, createdAt: serverTimestamp(), commentsAllowed: true,
            });
            
            // FIX: Use v8 doc syntax
            const jobSeekingRef = postsRef.doc();
            batch.set(jobSeekingRef, {
                 author: '김코치', authorId: 'user_seed_1', category: Category.JOB_SEEKING, location: '경기도 수원시', title: '[테니스] 선수 10년, 레슨 5년이상 코치 구직',
                 recruitmentField: '테니스', field: '테니스', playerCareer: '10', hasLessonCareer: true, lessonCareer: '5', memberManagementSkill: '상',
                 counselingSkill: '가능', workingType: '풀타임', workingHours: '시간 협의', workingDays: ['요일 협의'], salary: '급여 협의',
                 // FIX: Use v8 serverTimestamp
                 content: '성실하게 지도하겠습니다. 연락주세요.', views: 88, createdAt: serverTimestamp(), commentsAllowed: true,
            });

            // FIX: Use v8 doc syntax
            const courtTransferRef = postsRef.doc();
            batch.set(courtTransferRef, {
                author: '코트주인', authorId: 'user_seed_2', category: Category.COURT_TRANSFER, location: '인천광역시 연수구', title: '[인천광역시 연수구] 실내 테니스장 양도',
                courtType: '실내', area: '150평', monthlyRent: '800만원', premium: '1억 5천만원', content: '시설 깨끗하고 회원 많습니다. 개인 사정으로 급하게 양도합니다.',
                // FIX: Use v8 serverTimestamp
                imageUrl: 'https://i.imgur.com/S3yv1sU.png', views: 250, createdAt: serverTimestamp(), commentsAllowed: false,
            });

            // FIX: Use v8 doc syntax
            const freeBoardRef = postsRef.doc();
            batch.set(freeBoardRef, {
                author: '테니스사랑', authorId: 'user_seed_3', category: Category.FREE_BOARD, location: '', subCategory: '정보 공유',
                title: '초보자용 라켓 추천해주세요!', content: '테니스 시작한지 얼마 안된 테린이입니다. 입문용으로 괜찮은 라켓 있으면 추천 부탁드립니다!',
                // FIX: Use v8 serverTimestamp
                views: 55, createdAt: serverTimestamp(), commentsAllowed: true,
            });
        }

        // FIX: Use v8 collection/get syntax
        const announcementsRef = db.collection('announcements');
        const announcementsSnapshot = await announcementsRef.get();
        if (announcementsSnapshot.empty) {
            console.log("Seeding initial announcements...");
            needsCommit = true;
            // FIX: Use v8 doc syntax
            const newAnnouncementRef = announcementsRef.doc();
            batch.set(newAnnouncementRef, {
                title: '테니스포럼 서비스 정식 오픈!',
                content: '안녕하세요, 테니스 지도자와 관계자들을 위한 커뮤니티, 테니스포럼입니다. 많은 이용 부탁드립니다.',
                // FIX: Use v8 serverTimestamp
                createdAt: serverTimestamp(),
            });
        }
        
        // FIX: Use v8 collection/get syntax
        const advertisementsRef = db.collection('advertisements');
        const advertisementsSnapshot = await advertisementsRef.get();
        if (advertisementsSnapshot.empty) {
            console.log("Seeding initial advertisements...");
            needsCommit = true;
            // FIX: Use v8 doc syntax
            const newAdRef = advertisementsRef.doc();
            batch.set(newAdRef, {
                imageUrl: 'https://i.imgur.com/y1mGkUd.png',
                linkUrl: 'https://tennisforum.ai.kr',
                isActive: true,
                // FIX: Use v8 serverTimestamp
                createdAt: serverTimestamp(),
            });
        }

        if (needsCommit) {
            await batch.commit();
        }
    } catch (error) {
        handleFirestoreError(error, "초기 데이터 생성");
    }
};


const App: React.FC = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

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
    // FIX: Use v8 onAuthStateChanged syntax
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        if (!userAuth.emailVerified && userAuth.email !== ADMIN_EMAIL) {
            setVerificationEmail(userAuth.email);
            setPendingVerification(true);
            setIsAuthenticated(false);
            setCurrentUser(null);
        } else {
            setPendingVerification(false);
            setVerificationEmail(null);

            // FIX: Use v8 doc/get syntax
            const userRef = db.collection('users').doc(userAuth.uid);
            const isKnownAdmin = userAuth.email === ADMIN_EMAIL;

            try {
                let snapshot = await userRef.get();
                let userData;

                if (snapshot.exists) {
                    userData = snapshot.data();
                    if (isKnownAdmin && userData.role !== 'admin') {
                        // FIX: Use v8 update syntax
                        await userRef.update({ role: 'admin' });
                        // FIX: Use v8 get syntax
                        snapshot = await userRef.get();
                        userData = snapshot.data();
                    }
                } else {
                    console.warn(`User document not found for uid: ${userAuth.uid}. Creating new document.`);
                    const { displayName, email, photoURL } = userAuth;
                    const newUser: Omit<User, 'id'> = {
                        name: displayName || email?.split('@')[0] || '새 사용자',
                        role: isKnownAdmin ? 'admin' : 'user',
                        createdAt: new Date().toISOString(),
                        ...(photoURL && { avatarUrl: photoURL }),
                    };
                    // FIX: Use v8 set syntax
                    await userRef.set(newUser);
                    userData = newUser;
                }

                if (userData) {
                    const userForState = { id: userAuth.uid, ...userData } as User;
                    setCurrentUser(userForState);
                    setIsAuthenticated(true);
                } else {
                    console.error("Could not retrieve or create user data.");
                }
            } catch (error) {
                handleFirestoreError(error, "사용자 정보 처리");
            }
        }
      } else {
        setPendingVerification(false);
        setVerificationEmail(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearData();
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
        if (!currentUser) {
            clearData();
            setIsDataLoading(false);
            return;
        }

        setIsDataLoading(true);
        try {
            await seedInitialData();

            const [
                postsSnapshot, 
                announcementsSnapshot, 
                advertisementsSnapshot,
                bookmarksSnapshot
            ] = await Promise.all([
                // FIX: Use v8 collection/get syntax
                db.collection('posts').get(),
                db.collection('announcements').get(),
                db.collection('advertisements').get(),
                db.collection(`users/${currentUser.id}/bookmarks`).get()
            ]);

            // FIX: Explicitly type Set to avoid inference issues.
            const bookmarkIds = new Set<string>(bookmarksSnapshot.docs.map(doc => doc.id));
            setBookmarkedPostIds(bookmarkIds);
            
            const postList = postsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() 
                } as Post;
            });
            setPosts(postList);

            const announcementList = announcementsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() 
                } as Announcement;
            });
            setAnnouncements(announcementList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

            const adList = advertisementsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() 
                } as Advertisement;
            });
            setAdvertisements(adList.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

            if (currentUser.role === 'admin') {
                // FIX: Use v8 collection/get syntax
                const usersSnapshot = await db.collection('users').get();
                const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setUsers(userList);
            } else {
                setUsers([]);
            }

        } catch (error) {
            handleFirestoreError(error, "데이터 로딩");
        } finally {
            setIsDataLoading(false);
        }
    };
    
    fetchAllData();
  }, [currentUser]);

  const [viewingPrivacyPolicy, setViewingPrivacyPolicy] = useState(false);
  const [viewingTerms, setViewingTerms] = useState(false);
  const [viewingAnnouncements, setViewingAnnouncements] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
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

  const handleLogout = useCallback(async () => {
    // FIX: Use v8 signOut syntax
    await auth.signOut();
    setActiveTab('home');
    setHomeView('dashboard');
    setCurrentScreen('list');
  }, []);

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
        // FIX: Use v8 doc/update syntax
        const userRef = db.collection('users').doc(userId);
        await userRef.update({ name, avatarUrl });

        setCurrentUser(prev => prev ? { ...prev, name, avatarUrl } : null);
        setIsEditingProfile(false);
    } catch (error) {
        handleFirestoreError(error, "프로필 업데이트");
    }
  }, [currentUser]);

  const handleSelectPost = useCallback((postToSelect: Post) => {
    try {
        // FIX: Use v8 doc/update syntax
        const postRef = db.collection('posts').doc(postToSelect.id);
        postRef.update({ views: (postToSelect.views || 0) + 1 });
        
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
    // FIX: Use v8 doc syntax
    const bookmarkRef = db.collection('users').doc(currentUser.id).collection('bookmarks').doc(postId);
    
    try {
        if (newBookmarkedIds.has(postId)) {
            newBookmarkedIds.delete(postId);
            // FIX: Use v8 delete syntax
            await bookmarkRef.delete();
        } else {
            newBookmarkedIds.add(postId);
            // FIX: Use v8 set syntax
            await bookmarkRef.set({});
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
              // FIX: Use v8 doc/delete syntax
              const postRef = db.collection('posts').doc(postId);
              await postRef.delete();
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
        // FIX: Use v8 serverTimestamp
        const dataToSave = { ...newAnnouncement, createdAt: serverTimestamp() };
        // FIX: Use v8 collection/add syntax
        const docRef = await db.collection('announcements').add(dataToSave);
        
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
            // FIX: Use v8 doc/delete syntax
            await db.collection('announcements').doc(announcementId).delete();
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
            // FIX: Use v8 serverTimestamp
            createdAt: serverTimestamp(),
        };
        // FIX: Use v8 collection/add syntax
        const docRef = await db.collection('advertisements').add(dataToSave);
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
          // FIX: Use v8 doc/update syntax
          await db.collection('advertisements').doc(adId).update(updates);
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
              // FIX: Use v8 doc/delete syntax
              await db.collection('advertisements').doc(adId).delete();
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
      // FIX: Use v8 serverTimestamp
      createdAt: serverTimestamp(),
    };

    try {
      // FIX: Use v8 collection syntax
      const postsCollection = db.collection('posts');
      // FIX: Use v8 add syntax
      const docRef = await postsCollection.add(dataToSave as { [x: string]: any });

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

    // FIX: Use v8 doc syntax
    const postRef = db.collection('posts').doc(editingPost.id);
    try {
        // FIX: Use v8 update syntax
        await postRef.update(updatedPostData as { [x: string]: any });

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
    if (isAuthLoading || isDataLoading) {
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
  
  if (isAuthLoading) {
     return (
        <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative">
            <div className="flex h-full items-center justify-center">
                <p>인증 정보를 확인하는 중...</p>
            </div>
        </div>
     );
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
  
  if (pendingVerification) {
    // FIX: Use v8 signOut syntax
    return <EmailVerificationScreen email={verificationEmail} onBackToLogin={() => auth.signOut()} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTerms={handleShowTerms} />;
  }
  
  if (currentUser?.role === 'admin') {
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