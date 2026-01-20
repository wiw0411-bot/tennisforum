import React, { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
// FIX: Use namespace import for firebase/auth to resolve export errors.
import * as firebaseAuth from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { User } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

import { loginBackgroundImage } from '../assets/imageAssets';

interface LoginScreenProps {
  onShowPrivacyPolicy: () => void;
  onShowTerms: () => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onShowPrivacyPolicy, onShowTerms, onBack }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');

  // Sign up fields
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Email check states
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  // Nickname check states
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);


  useEffect(() => {
    if (isLoginView) {
        setErrors({}); // 로그인 뷰로 전환 시 에러 초기화
        return;
    };

    const newErrors: { [key: string]: string } = {};

    // Password validation
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password && (password.length < 8 || !specialCharRegex.test(password))) {
        newErrors.password = '비밀번호는 8자 이상이며, 특수문자를 포함해야 합니다.';
    }

    // Password confirmation validation
    if (passwordConfirm && password !== passwordConfirm) {
        newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    // Nickname validation
    if (nickname) {
        const koreanChars = nickname.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g) || [];
        if (koreanChars.length > 5 || nickname.length > 10) {
             newErrors.nickname = '닉네임은 한글 5자, 영문 10자 이내로 입력해주세요.';
        }
    }

    setErrors(newErrors);
  }, [password, passwordConfirm, nickname, isLoginView]);


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };
  
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setIsNicknameChecked(false);
    setIsNicknameAvailable(false);
    setNicknameCheckMessage('');
  };
  
  const isSignUpFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    return isEmailValid && isEmailChecked && isEmailAvailable &&
           isNicknameChecked && isNicknameAvailable &&
           phone && password && passwordConfirm && nickname && Object.keys(errors).length === 0;
  }, [email, password, passwordConfirm, nickname, phone, errors, isEmailChecked, isEmailAvailable, isNicknameChecked, isNicknameAvailable]);

  const handleEmailCheck = async () => {
    if (!email || isCheckingEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setEmailCheckMessage('올바른 이메일 형식이 아닙니다.');
        return;
    }

    setIsCheckingEmail(true);
    setEmailCheckMessage('');
    try {
        // FIX: Use namespaced firebase auth function.
        const methods = await firebaseAuth.fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
            setEmailCheckMessage('이미 사용 중인 이메일입니다.');
            setIsEmailAvailable(false);
        } else {
            setEmailCheckMessage('사용 가능한 이메일입니다.');
            setIsEmailAvailable(true);
        }
        setIsEmailChecked(true);
    } catch (error) {
        console.error("Email check error:", error);
        setEmailCheckMessage('중복 확인 중 오류가 발생했습니다.');
        setIsEmailAvailable(false);
    } finally {
        setIsCheckingEmail(false);
    }
  };
  
  const handleNicknameCheck = async () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || isCheckingNickname) return;
    if (errors.nickname) {
        setNicknameCheckMessage(errors.nickname);
        return;
    }

    setIsCheckingNickname(true);
    setNicknameCheckMessage('');
    try {
        const nicknameRef = doc(db, 'nicknames', trimmedNickname);
        const docSnap = await getDoc(nicknameRef);

        if (docSnap.exists()) {
            setNicknameCheckMessage('이미 사용 중인 닉네임입니다.');
            setIsNicknameAvailable(false);
        } else {
            setNicknameCheckMessage('사용 가능한 닉네임입니다.');
            setIsNicknameAvailable(true);
        }
        setIsNicknameChecked(true);
    } catch (error) {
        console.error("Nickname check error:", error);
        setNicknameCheckMessage('중복 확인 중 오류가 발생했습니다.');
        setIsNicknameAvailable(false);
    } finally {
        setIsCheckingNickname(false);
    }
  };
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (isLoginView) {
      try {
        // FIX: Use namespaced firebase auth function.
        await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setApiError('이메일 또는 비밀번호가 잘못되었습니다.');
        } else {
            setApiError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } else { // Sign Up
      if (!isSignUpFormValid) {
        setApiError('입력 정보를 다시 확인해주세요.');
        return;
      }
      try {
        auth.languageCode = 'ko'; // Set language before sending email
        // FIX: Use namespaced firebase auth function.
        const { user } = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
        if (!user) {
            throw new Error("User creation failed.");
        }
        
        // Create user profile and nickname document atomically
        const { photoURL } = user;
        const createdAt = new Date().toISOString();
        const newUser: Omit<User, 'id'> = {
            name: nickname,
            phone: phone,
            role: 'user',
            createdAt,
            ...(photoURL && { avatarUrl: photoURL }),
        };

        const batch = writeBatch(db);
        
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, newUser);
        
        const nicknameRef = doc(db, 'nicknames', nickname);
        batch.set(nicknameRef, { userId: user.uid });
        
        await batch.commit();

        // FIX: Use namespaced firebase auth function.
        await firebaseAuth.sendEmailVerification(user);
        // After this, the onAuthStateChanged listener in App.tsx will detect the new unverified user.
      } catch (err: any) {
         if (err.code === 'auth/email-already-in-use') {
          setApiError('이미 사용 중인 이메일입니다.');
        } else {
          setApiError('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
      }
    }
  };

  const renderLoginView = () => (
    <>
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">로그인</h2>
      {apiError && <p className="text-red-500 text-xs text-center mb-3">{apiError}</p>}
      <form onSubmit={handleEmailAuth} className="space-y-3">
          <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              required
              className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"
          />
          <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500"
          />
          <button
              type="submit"
              className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff5710] text-white font-semibold text-sm transition-transform active:scale-95"
          >
            로그인
          </button>
      </form>
      <button onClick={() => { setIsLoginView(false); setApiError(''); }} className="w-full mt-2 text-xs text-center font-semibold text-[#ff5710] hover:underline">
          계정이 없으신가요? 회원가입
      </button>
    </>
  );
  
  const renderSignUpView = () => (
     <>
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">회원가입</h2>
      {apiError && <p className="text-red-500 text-xs text-center mb-3">{apiError}</p>}
      <form onSubmit={handleEmailAuth} className="space-y-2">
          <div>
            <div className="flex items-center space-x-2">
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => { 
                        setEmail(e.target.value); 
                        setIsEmailChecked(false);
                        setIsEmailAvailable(false);
                        setEmailCheckMessage('');
                    }} 
                    placeholder="이메일" 
                    required 
                    className="flex-grow w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" 
                />
                <button 
                    type="button" 
                    onClick={handleEmailCheck}
                    disabled={isCheckingEmail || !email}
                    className="flex-shrink-0 h-12 px-4 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 disabled:opacity-50"
                >
                    {isCheckingEmail ? '확인 중...' : '중복확인'}
                </button>
            </div>
            {emailCheckMessage && (
                <p className={`text-xs mt-1 px-2 ${isEmailAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {emailCheckMessage}
                </p>
            )}
          </div>
          <div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 (8자 이상, 특수문자 포함)" required className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
            {errors.password && <p className="text-red-500 text-xs mt-1 px-2">{errors.password}</p>}
          </div>
          <div>
            <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="비밀번호 확인" required className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
            {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1 px-2">{errors.passwordConfirm}</p>}
          </div>
          <div>
             <div className="flex items-center space-x-2">
                <input type="text" value={nickname} onChange={handleNicknameChange} placeholder="닉네임 (한글 5자, 영문 10자 이내)" required className="flex-grow w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
                <button 
                    type="button" 
                    onClick={handleNicknameCheck}
                    disabled={isCheckingNickname || !nickname || !!errors.nickname}
                    className="flex-shrink-0 h-12 px-4 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 disabled:opacity-50"
                >
                    {isCheckingNickname ? '확인 중...' : '중복확인'}
                </button>
             </div>
             {errors.nickname ? <p className="text-red-500 text-xs mt-1 px-2">{errors.nickname}</p> : 
                nicknameCheckMessage && <p className={`text-xs mt-1 px-2 ${isNicknameAvailable ? 'text-green-600' : 'text-red-500'}`}>{nicknameCheckMessage}</p>
             }
          </div>
          <div>
            <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="연락처 (11자리, - 제외)" required className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
          </div>
          <div className="pt-2">
            <button
                type="submit"
                disabled={!isSignUpFormValid}
                className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff5710] text-white font-semibold text-sm transition-transform active:scale-95 disabled:bg-[#ffc2aa] disabled:cursor-not-allowed"
            >
              가입하고 인증하기
            </button>
          </div>
      </form>
      <button onClick={() => { setIsLoginView(true); setApiError(''); }} className="w-full mt-2 text-xs text-center text-gray-500 hover:text-[#ff5710]">
          이미 계정이 있으신가요? 로그인
      </button>
    </>
  )

  return (
    <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col animate-fade-in overflow-hidden border border-gray-100 shadow-lg relative">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 text-white bg-black/20 hover:bg-black/40 rounded-full z-20"
        aria-label="뒤로가기"
      >
        <ArrowLeftIcon />
      </button>
      <div 
        className="relative flex-grow flex flex-col items-center justify-center text-center p-8 shadow-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBackgroundImage})` }}
      />
      
      <div className="bg-white px-8 pb-8 pt-6 rounded-t-2xl -mt-4 z-10">
        {isLoginView ? renderLoginView() : renderSignUpView()}
        
        <p className="text-center text-[9px] text-gray-400 mt-6 pt-10">
          로그인 시 서비스{' '}
          <button onClick={onShowTerms} className="font-semibold underline">
              이용약관
          </button>
          {' '}및{' '}
          <button onClick={onShowPrivacyPolicy} className="font-semibold underline">
            개인정보처리방침
          </button>
          에
          <br />
          동의하게 됩니다.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;