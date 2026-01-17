import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface PhoneVerificationScreenProps {
  phone: string;
  onVerify: () => void;
  onBack: () => void;
}

const PhoneVerificationScreen: React.FC<PhoneVerificationScreenProps> = ({ phone, onVerify, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(60);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  const setupRecaptchaAndSend = async () => {
    try {
      setIsSending(true);
      setError('');

      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA solved */ },
        'expired-callback': () => {
            setError('reCAPTCHA가 만료되었습니다. 재전송 버튼을 눌러 다시 시도해주세요.');
        }
      });
      (window as any).recaptchaVerifier = verifier;
      
      const formattedPhone = `+82${phone.substring(1)}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      
      setConfirmationResult(result);
      setIsSending(false);
      setResendCooldown(60);
    } catch (err) {
      console.error("Phone auth error:", err);
      setError('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (recaptchaContainerRef.current) {
        setupRecaptchaAndSend();
    }
  }, []);

  useEffect(() => {
    if (resendCooldown > 0 && !isSending) {
      const timerId = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendCooldown, isSending]);


  const handleVerify = async () => {
    if (!confirmationResult) {
      setError('인증 절차를 다시 시작해주세요.');
      return;
    }
    setError('');
    try {
      await confirmationResult.confirm(code);
      onVerify();
    } catch (err) {
      setError('인증번호가 올바르지 않습니다.');
    }
  };
  
  const handleResend = () => {
      if (resendCooldown === 0 && !isSending) {
          setCode('');
          setupRecaptchaAndSend();
      }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col animate-fade-in overflow-hidden border border-gray-100 shadow-lg">
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
          aria-label="뒤로가기"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-900">휴대폰 번호 인증</h1>
      </header>
      <div className="p-8 flex flex-col justify-center flex-grow">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">{phone}</span>으로
              <br />
              인증번호가 발송되었습니다.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="tel"
              value={code}
              onChange={handleCodeChange}
              placeholder="인증번호 6자리"
              required
              maxLength={6}
              className="w-full h-12 px-4 rounded-xl bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5710] text-center tracking-[.5em] text-gray-900 placeholder-gray-500"
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={code.length !== 6}
              className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff5710] text-white font-semibold text-sm transition-transform active:scale-95 disabled:bg-[#ffc2aa]"
            >
              인증하기
            </button>
          </div>
          <div className="text-center mt-4">
              <button onClick={handleResend} disabled={resendCooldown > 0 || isSending} className="text-xs text-gray-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                  {isSending ? '발송 중...' : resendCooldown > 0 ? `${resendCooldown}초 후 재전송 가능` : '인증번호를 받지 못하셨나요?'}
              </button>
          </div>
      </div>
    </div>
  );
};

export default PhoneVerificationScreen;
