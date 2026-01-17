import React, { useState, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types';

import GoogleIcon from './icons/GoogleIcon';
import { loginBackgroundImage } from '../assets/imageAssets';

interface LoginScreenProps {
  onAdminLogin: () => void;
  onSignUpSuccess: (user: FirebaseUser, phone: string) => void;
  onShowPrivacyPolicy: () => void;
  onShowTerms: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAdminLogin, onSignUpSuccess, onShowPrivacyPolicy, onShowTerms }) => {
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
  };
  
  const isSignUpFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPhoneValid = phone.length === 11;

    return isEmailValid && phone && password && passwordConfirm && nickname && Object.keys(errors).length === 0;
  }, [email, password, passwordConfirm, nickname, phone, errors]);


  const createUserProfileDocument = async (userAuth: FirebaseUser, additionalData: { name: string; phone: string }) => {
      const userRef = doc(db, 'users', userAuth.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
          const { photoURL } = userAuth;
          const createdAt = new Date().toISOString();
          const newUser: Omit<User, 'id'> = {
              name: additionalData.name,
              phone: additionalData.phone,
              role: 'user',
              createdAt,
              phoneVerified: false,
              ...(photoURL && { avatarUrl: photoURL }),
          };
          try {
              await setDoc(userRef, newUser);
          } catch(err) {
              console.error("Error creating user document", err);
              throw err;
          }
      }
      return userRef;
  };
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (isLoginView) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        setApiError('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } else { // Sign Up
      if (!isSignUpFormValid) {
        setApiError('입력 정보를 다시 확인해주세요.');
        return;
      }
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfileDocument(user, { name: nickname, phone });
        onSignUpSuccess(user, phone);
      } catch (err: any) {
         if (err.code === 'auth/email-already-in-use') {
          setApiError('이미 사용 중인 이메일입니다.');
        } else {
          setApiError('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
      }
    }
  };
  
  const handleGoogleSignIn = async () => {
    setApiError('');
    const provider = new GoogleAuthProvider();
    try {
        const { user } = await signInWithPopup(auth, provider);
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) {
            await createUserProfileDocument(user, { name: user.displayName || 'Google 사용자', phone: '' });
        }
    } catch(err) {
        setApiError('구글 로그인에 실패했습니다.');
        console.error(err);
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
      <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-2 text-xs text-gray-400">또는</span>
          <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="w-full space-y-3">
          <button
              onClick={handleGoogleSignIn}
              className="w-full h-12 flex items-center justify-center rounded-xl bg-white border border-gray-300 text-gray-700 font-medium text-sm transition-transform active:scale-95 hover:bg-gray-50"
          >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Google 계정으로 계속하기
          </button>
      </div>
    </>
  );
  
  const renderSignUpView = () => (
     <>
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">회원가입</h2>
      {apiError && <p className="text-red-500 text-xs text-center mb-3">{apiError}</p>}
      <form onSubmit={handleEmailAuth} className="space-y-2">
          <div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일" required className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
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
            <input type="text" value={nickname} onChange={handleNicknameChange} placeholder="닉네임 (한글 5자 / 영문 10자)" required className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-gray-900 placeholder-gray-500" />
            {errors.nickname && <p className="text-red-500 text-xs mt-1 px-2">{errors.nickname}</p>}
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
              가입하기
            </button>
          </div>
      </form>
      <button onClick={() => { setIsLoginView(true); setApiError(''); }} className="w-full mt-2 text-xs text-center text-gray-500 hover:text-[#ff5710]">
          이미 계정이 있으신가요? 로그인
      </button>
    </>
  )

  return (
    <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col animate-fade-in overflow-hidden border border-gray-100 shadow-lg">
      <div 
        className="relative flex-grow flex flex-col items-center justify-center text-center p-8 shadow-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBackgroundImage})` }}
      />
      
      <div className="bg-white px-8 pb-8 pt-6 rounded-t-2xl -mt-4 z-10">
        {isLoginView ? renderLoginView() : renderSignUpView()}
        
        <button
            onClick={onAdminLogin}
            className="w-full mt-4 h-12 flex items-center justify-center text-gray-500 font-medium text-sm hover:text-[#ff5710]"
        >
            관리자모드로 로그인
        </button>

        <p className="text-center text-[9px] text-gray-400 mt-6">
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