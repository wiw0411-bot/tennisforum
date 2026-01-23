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
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp, Timestamp, query, orderBy, increment, addDoc } from 'firebase/firestore';
// FIX: Use namespace import for firebase/auth to resolve export errors.
import * as firebaseAuth from 'firebase/auth';

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
    const batch = writeBatch(db);
    let needsCommit = false;

    try {
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);
        if (postsSnapshot.empty) {
            console.log("Seeding initial posts...");
            needsCommit = true;
            
            const jobPostingRef = doc(postsRef);
            batch.set(jobPostingRef, {
                author: '서울테니스클럽', authorId: 'admin_seed', category: Category.JOB_POSTING, location: '서울특별시 강남구', title: '서울테니스클럽',
                recruitmentField: '테니스', workingType: '풀타임', workingHours: '09:00 ~ 18:00', workingDays: ['월', '화', '수', '목', '금'],
                salary: '월급 350만원', content: '경력 3년 이상 코치님을 모집합니다. 자세한 내용은 문의 바랍니다.', imageUrl: 'https://i.imgur.com/K2H1KaY.png',
                views: 120, createdAt: serverTimestamp(), commentsAllowed: true,
            });
            
            const jobSeekingRef = doc(postsRef);
            batch.set(jobSeekingRef, {
                 author: '김코치', authorId: 'user_seed_1', category: Category.JOB_SEEKING, location: '경기도 수원시', title: '[테니스] 선수 10년, 레슨 5년이상 코치 구직',
                 recruitmentField: '테니스', field: '테니스', playerCareer: '10', hasLessonCareer: true, lessonCareer: '5', memberManagementSkill: '상',
                 counselingSkill: '가능', workingType: '풀타임', workingHours: '시간 협의', workingDays: ['요일 협의'], salary: '급여 협의',
                 content: '성실하게 지도하겠습니다. 연락주세요.', views: 88, createdAt: serverTimestamp(), commentsAllowed: true,
            });

            const courtTransferRef = doc(postsRef);
            batch.set(courtTransferRef, {
                author: '코트주인', authorId: 'user_seed_2', category: Category.COURT_TRANSFER, location: '인천광역시 연수구', title: '[인천광역시 연수구] 실내 테니스장 양도',
                courtType: '실내', area: '150평', monthlyRent: '800만원', premium: '1억 5천만원', content: '시설 깨끗하고 회원 많습니다. 개인 사정으로 급하게 양도합니다.',
                imageUrl: 'https://i.imgur.com/S3yv1sU.png', views: 250, createdAt: serverTimestamp(), commentsAllowed: false,
            });

            const freeBoardRef = doc(postsRef);
            batch.set(freeBoardRef, {
                author: '테니스사랑', authorId: 'user_seed_3', category: Category.FREE_BOARD, location: '', subCategory: '정보 공유',
                title: '초보자용 라켓 추천해주세요!', content: '테니스 시작한지 얼마 안된 테린이입니다. 입문용으로 괜찮은 라켓 있으면 추천 부탁드립니다!',
                views: 55, createdAt: serverTimestamp(), commentsAllowed: true,
            });

            const freeBoardRef2 = doc(postsRef);
            batch.set(freeBoardRef2, {
                author: '스트링전문가', authorId: 'user_seed_4', category: Category.FREE_BOARD, location: '', subCategory: '정보 공유',
                title: '[정보] 입문자를 위한 테니스 스트링 종류와 선택 가이드', 
                content: '안녕하세요! 스트링만 바꿔도 테니스가 확 달라지는 경험, 다들 있으시죠?\n\n처음 시작하시는 분들을 위해 간단하게 스트링 종류를 정리해봤습니다.\n\n1. 폴리(Poly): 컨트롤과 스핀에 강점! 내구성이 좋아서 스트링이 자주 끊어지는 분들께 추천해요. 다만, 팔에 부담이 갈 수 있습니다.\n\n2. 멀티필라멘트(Multifilament): 부드러운 타구감과 파워가 장점! 팔이 편안해서 엘보우 등 부상 위험이 있는 분들께 좋습니다.\n\n3. 천연 GUT: 최고의 성능을 자랑하지만, 가격이 비싸고 습기에 약해 관리가 어렵습니다. 선수들이 많이 사용하죠.\n\n어떤 스트링을 선택해야 할지 고민이라면, 코치님이나 동호회 선배님들께 조언을 구하는 것이 가장 좋습니다! 다들 즐테하세요!',
                views: 72, createdAt: serverTimestamp(), commentsAllowed: true,
            });
        }

        const announcementsRef = collection(db, 'announcements');
        const announcementsSnapshot = await getDocs(announcementsRef);
        if (announcementsSnapshot.empty) {
            console.log("Seeding initial announcements...");
            needsCommit = true;
            const newAnnouncementRef = doc(announcementsRef);
            batch.set(newAnnouncementRef, {
                title: '테니스포럼 서비스 정식 오픈!',
                content: '안녕하세요, 테니스 지도자와 관계자들을 위한 커뮤니티, 테니스포럼입니다. 많은 이용 부탁드립니다.',
                createdAt: serverTimestamp(),
                isActive: true,
            });
        }
        
        const advertisementsRef = collection(db, 'advertisements');
        const advertisementsSnapshot = await getDocs(advertisementsRef);
        if (advertisementsSnapshot.empty) {
            console.log("Seeding initial advertisements...");
            needsCommit = true;
            const newAdRef = doc(advertisementsRef);
            batch.set(newAdRef, {
                imageUrl: 'https://i.imgur.com/y1mGkUd.png',
                linkUrl: 'https://tennisforum.ai.kr',
                isActive: true,
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
  const [isLoginRequired, setIsLoginRequired] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  
  // Data loading state
  const [isDataLoading, setIsDataLoading] = useState(true);

  const clearUserData = () => {
      setUsers([]);
      setBookmarkedPostIds(new Set());
  }
  
  const requireLogin = useCallback(() => setIsLoginRequired(true), []);

  useEffect(() => {
    // FIX: Use namespaced firebase auth function.
    const unsubscribe = firebaseAuth.onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        if (!userAuth.emailVerified && userAuth.email !== ADMIN_EMAIL) {
            setVerificationEmail(userAuth.email);
            setPendingVerification(true);
            setIsAuthenticated(false);
            setCurrentUser(null);
            clearUserData();
        } else {
            setIsLoginRequired(false);
            setPendingVerification(false);
            setVerificationEmail(null);

            const userRef = doc(db, 'users', userAuth.uid);
            const isKnownAdmin = userAuth.email === ADMIN_EMAIL;

            try {
                let snapshot = await getDoc(userRef);
                let userData;

                if (snapshot.exists()) {
                    userData = snapshot.data();
                    if (isKnownAdmin && userData.role !== 'admin') {
                        await updateDoc(userRef, { role: 'admin' });
                        snapshot = await getDoc(userRef);
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
                    await setDoc(userRef, newUser);
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
        clearUserData();
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // Fetch public data on initial load
  useEffect(() => {
    const fetchPublicData = async () => {
        setIsDataLoading(true);
        try {
            // NOTE: Seeding data is an admin action and should not be run on the client-side for every user.
            // await seedInitialData();

            const [postsSnapshot, announcementsSnapshot, advertisementsSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'))),
                getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))),
                getDocs(query(collection(db, 'advertisements'), orderBy('createdAt', 'desc')))
            ]);

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
                return { id: doc.id, ...data, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() } as Announcement;
            });
            setAnnouncements(announcementList);

            const adList = advertisementsSnapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString() } as Advertisement;
            });
            setAdvertisements(adList);
        } catch (error) {
            handleFirestoreError(error, "공개 데이터 로딩");
        } finally {
            setIsDataLoading(false);
        }
    };
    fetchPublicData();
  }, []);

  // Fetch user-specific data when user logs in or out
  useEffect(() => {
    const fetchUserData = async () => {
        if (!currentUser) {
            clearUserData();
            return;
        }

        try {
            const bookmarksSnapshot = await getDocs(collection(db, `users/${currentUser.id}/bookmarks`));
            const bookmarkIds = new Set<string>(bookmarksSnapshot.docs.map(doc => doc.id));
            setBookmarkedPostIds(bookmarkIds);

            if (currentUser.role === 'admin') {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setUsers(userList);
            }
        } catch (error) {
            handleFirestoreError(error, "사용자 데이터 로딩");
        }
    };
    
    fetchUserData();
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
    // FIX: Use namespaced firebase auth function.
    await firebaseAuth.signOut(auth);
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
  
  const handleShowProfileEdit = useCallback(() => {
      if (!currentUser) {
          requireLogin();
          return;
      }
      setIsEditingProfile(true);
  }, [currentUser, requireLogin]);

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
    const updatedPost = { ...postToSelect, views: (postToSelect.views || 0) + 1 };
    
    // Optimistically update UI for a smoother experience
    setPosts(prevPosts => prevPosts.map(p => p.id === postToSelect.id ? updatedPost : p));
    setSelectedPost(updatedPost);
    setIsCreatingPost(false);
    setEditingPost(null);

    // Always attempt to update Firestore for view count and stats
    try {
        const postRef = doc(db, 'posts', postToSelect.id);
        updateDoc(postRef, { views: increment(1) });

        const todayStr = new Date().toISOString().split('T')[0];
        const dailyStatRef = doc(db, 'dailyStats', todayStr);
        setDoc(dailyStatRef, { views: increment(1) }, { merge: true });
    } catch (error) {
        // Log the error but don't bother the user with an alert,
        // as the UI has already been updated and the rule change should prevent this.
        console.error(`Firestore error (조회수/통계 업데이트):`, error);
    }
  }, []);
  
  const handleToggleBookmark = useCallback(async (postId: string) => {
    if (!currentUser) {
        requireLogin();
        return;
    }

    const newBookmarkedIds = new Set(bookmarkedPostIds);
    const bookmarkRef = doc(db, 'users', currentUser.id, 'bookmarks', postId);
    
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
  }, [currentUser, bookmarkedPostIds, requireLogin]);
  
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


  const handleCreateAnnouncement = useCallback(async (newAnnouncement: Omit<Announcement, 'id' | 'createdAt' | 'isActive'>) => {
    try {
        const dataToSave = { ...newAnnouncement, isActive: true, createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, 'announcements'), dataToSave);
        
        const announcementToAdd: Announcement = {
            id: docRef.id,
            ...newAnnouncement,
            isActive: true,
            createdAt: new Date().toISOString(),
        };
        setAnnouncements(prev => [announcementToAdd, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
        handleFirestoreError(error, "공지사항 등록");
    }
  }, []);

  const handleUpdateAnnouncement = useCallback(async (announcementId: string, updates: Partial<Pick<Announcement, 'isActive'>>) => {
      const originalAnnouncements = announcements;
      setAnnouncements(prev => prev.map(ann => ann.id === announcementId ? { ...ann, ...updates } : ann));
      try {
          await updateDoc(doc(db, 'announcements', announcementId), updates);
      } catch (error) {
          setAnnouncements(originalAnnouncements);
          handleFirestoreError(error, "공지사항 업데이트");
      }
  }, [announcements]);

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
    if (!currentUser) {
        requireLogin();
        return;
    }
    setSelectedPost(null);
    setEditingPost(null);
    setActiveTab('home');
    setIsCreatingPost(true);
  }, [currentUser, requireLogin]);

  const handleCancelCreate = useCallback(() => setIsCreatingPost(false), []);

  const handleCreatePost = useCallback(async (newPostData: Omit<Post, 'id' | 'createdAt' | 'views'>) => {
    if (!currentUser) {
        requireLogin();
        return;
    }

    const dataToSave = {
      ...newPostData,
      authorId: currentUser.id,
      author: newPostData.category === Category.JOB_SEEKING ? currentUser.name : newPostData.title,
      ...(currentUser.avatarUrl && { authorAvatar: currentUser.avatarUrl }),
      views: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
    };

    try {
      const postsCollection = collection(db, 'posts');
      const docRef = await addDoc(postsCollection, dataToSave);

      const postToAdd: Post = {
        id: docRef.id,
        ...newPostData,
        authorId: currentUser.id,
        author: newPostData.category === Category.JOB_SEEKING ? currentUser.name : newPostData.title,
        ...(currentUser.avatarUrl && { authorAvatar: currentUser.avatarUrl }),
        views: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
      };

      setPosts(prevPosts => [postToAdd, ...prevPosts]);
      setIsCreatingPost(false);
      setActiveCategory(newPostData.category);

    } catch (error) {
        handleFirestoreError(error, "게시물 등록");
    }
  }, [currentUser, requireLogin]);

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
  
  const handlePostUpdate = useCallback((updatedPost: Post) => {
      setSelectedPost(updatedPost);
      setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  }, []);

  const handleTabChange = useCallback((tab: 'home' | 'schedule' | 'notifications' | 'myInfo') => {
    const isProtectedTab = tab === 'schedule' || tab === 'notifications' || tab === 'myInfo';
    if(isProtectedTab && !isAuthenticated) {
        requireLogin();
        return;
    }
    
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
  }, [activeTab, isAuthenticated, requireLogin]);
  
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
    if (selectedPost) {
      return <PostDetail post={selectedPost} onBack={handleBackToList} currentUser={currentUser} onDeletePost={handleDeletePost} onEditPost={handleShowEditForm} onRequestLogin={requireLogin} onPostUpdate={handlePostUpdate} />;
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
                        <div className="flex-grow overflow-y-auto hide-scrollbar">
                            <div className="flex-shrink-0 bg-white px-4 pt-4">
                                <AdBanner advertisements={advertisements} />
                            </div>
                            <Header 
                                activeCategory={activeCategory}
                                setActiveCategory={handleSetActiveCategory}
                            />
                            <main>
                               <div className="px-4 pt-4 flex-shrink-0 bg-white">
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
                               <div className="overflow-hidden">
                                    <div 
                                        className="flex transition-transform duration-300 ease-in-out"
                                        style={{ transform: `translateX(-${categoryIndex * 100}%)` }}
                                    >
                                        {CATEGORIES.map(category => (
                                            <div key={category.id} className="w-full flex-shrink-0 px-4 pb-20">
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
                    </div>
                );
        }
    }

    return (
        <>
            {mainContent()}
            {activeTab === 'home' && homeView === 'board' && !isCreatingPost && !selectedPost && <CreatePostButton onClick={handleShowCreateForm} />}
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
  
  if (isAuthLoading || isDataLoading) {
     return (
        <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col overflow-hidden border border-gray-100 shadow-lg relative">
            <div className="flex h-full items-center justify-center">
                <p>데이터를 불러오는 중...</p>
            </div>
        </div>
     );
  }
  
  if (isLoginRequired) {
    return <LoginScreen onShowPrivacyPolicy={handleShowPrivacyPolicy} onShowTerms={handleShowTerms} onBack={() => setIsLoginRequired(false)} />;
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
    return <EmailVerificationScreen email={verificationEmail} onBackToLogin={() => firebaseAuth.signOut(auth)} />;
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
                onUpdateAnnouncement={handleUpdateAnnouncement}
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
