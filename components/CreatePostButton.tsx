import React from 'react';
import PlusIcon from './icons/PlusIcon';

const CreatePostButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute bottom-20 right-4 transform bg-[#ff5710] text-white rounded-full py-2.5 px-4 shadow-lg hover:bg-[#e64e0e] transition-transform active:scale-95 z-20 flex items-center"
    aria-label="새 게시물 작성"
  >
    <PlusIcon />
    <span className="font-bold text-xs ml-0.5">글쓰기</span>
  </button>
);

export default CreatePostButton;