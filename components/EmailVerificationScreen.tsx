
import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
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
            await sendEmailVerification(auth.currentUser);
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
                이메일을 받지 못하셨나요? 스팸 메일함을 확인하거나<br/>
                아래 버튼을 눌러 다시 받아보세요.
            </p>
            <div className="w-full mt-6 space-y-3">
                <button
                    onClick={handleResend}
                    disabled={isSending}
                    className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff5710] text-white font-semibold text-sm transition-transform active:scale-95 disabled:bg-[#ffc2aa]"
                >
                    {isSending ? '전송 중...' : '인증 이메일 재전송'}
                </button>
                <button
                    onClick={onBackToLogin}
                    className="w-full text-xs text-center text-gray-500 hover:text-[#ff5710]"
                >
                    로그인 화면으로 돌아가기
                </button>
            </div>
            {message && <p className={`text-xs mt-4 ${message.includes('실패') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
        </div>
    );
};

export default EmailVerificationScreen;
