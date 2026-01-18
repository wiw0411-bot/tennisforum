import React, { useState, useRef } from 'react';
import { User } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import CameraIcon from './icons/CameraIcon';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileEditScreenProps {
  currentUser: User;
  onBack: () => void;
  onSave: (profileData: { name: string; avatarUrl: string | undefined }) => void;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ currentUser, onBack, onSave }) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState<string | undefined>(currentUser.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const storageRef = ref(storage, `avatars/${currentUser.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setAvatar(downloadURL);
      } catch (error) {
        console.error("Avatar upload failed:", error);
        alert("프로필 사진 업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), avatarUrl: avatar });
    }
  };

  return (
    <>
      <div className="animate-fade-in h-full flex flex-col">
        <header className="bg-white sticky top-0 z-10 p-4 border-b flex items-center justify-center h-16 flex-shrink-0">
          <button
            onClick={onBack}
            className="absolute left-4 p-2 -ml-2 text-gray-500 hover:text-gray-800"
            aria-label="뒤로가기"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-lg font-bold text-gray-900">프로필 수정</h1>
        </header>
        <main className="flex-grow p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                  <button
                      type="button"
                      className="w-24 h-24 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      aria-label="프로필 사진 변경"
                      disabled={isUploading}
                  >
                      {avatar ? (
                          <img src={avatar} alt="프로필" className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                          <UserCircleIcon className="w-24 h-24 text-gray-300" />
                      )}
                      {isUploading ? (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">업로드중...</span>
                          </div>
                      ) : (
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-gray-200 shadow-sm hover:bg-gray-100">
                            <CameraIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                  </button>
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                      accept="image/*"
                      disabled={isUploading}
                  />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                maxLength={5}
              />
              <p className="mt-2 text-xs text-gray-500">다른 사용자에게 표시되는 이름입니다. (한글 5자 이내)</p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !name.trim() || (name.trim() === currentUser.name && avatar === currentUser.avatarUrl)}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium disabled:bg-orange-300 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default ProfileEditScreen;