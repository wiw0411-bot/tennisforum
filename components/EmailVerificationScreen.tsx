

import React, { useState } from 'react';
import { auth } from '../firebase';
// FIX: The project seems to be using Firebase v8 SDK.
// Removed v9 modular import for auth.
import MailIcon from './icons/MailIcon';

interface EmailVerificationScreenProps {
  email: string | null;
  onBackToLogin: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ email, onBackToLogin }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleResend = async () => {
        if (!auth.currentUser || isSending) return;
        setIsSending(true);
        setMessage('');
        try {
            // FIX: Use v8 sendEmailVerification syntax
            await auth.currentUser.sendEmailVerification();
            setMessage('인증 이메일을 다시 보냈습니다. 받은편지함을 확인해주세요.');
        } catch (error) {
            setMessage('이메일 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-white h-full font-sans w-full max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-[#fff8f5] text-[#ff5710] rounded-full flex items-center justify-center mb-6">
                <MailIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">이메일을 확인해주세요</h1>
            <p className="text-sm text-gray-600 mt-2">
                회원가입을 완료하려면 이메일 인증이 필요합니다.<br/>
                <strong>{email}</strong>(으)로 발송된<br/>
                인증 링크를 클릭해주세요.
            </p>
            <p className="text-xs text-gray-500 mt-4">
                인증을 완료하셨다면 아래 버튼을 눌러주세요.
            </p>
            <div className="w-full mt-6 space-y-4">
                <button
                    onClick={onBackToLogin}
                    className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff5710] text-white font-semibold text-sm transition-transform active:scale-95"
                >
                    인증완료
                </button>
                <div className="flex justify-center items-center space-x-4">
                    <button
                        onClick={handleResend}
                        disabled={isSending}
                        className="text-xs text-center text-gray-500 hover:text-[#ff5710] disabled:text-gray-400"
                    >
                        {isSending ? '전송 중...' : '인증 이메일 재전송'}
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={onBackToLogin}
                        className="text-xs text-center text-gray-500 hover:text-[#ff5710]"
                    >
                        로그인 화면으로 돌아가기
                    </button>
                </div>
            </div>
            {message && <p className={`text-xs mt-4 ${message.includes('실패') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
        </div>
    );
};

export default EmailVerificationScreen;