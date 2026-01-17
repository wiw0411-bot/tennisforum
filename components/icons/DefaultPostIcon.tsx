import React from 'react';

const DefaultPostIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Tennis Forum Default Post Image"
    fontFamily="Pretendard, sans-serif"
  >
    <rect width="100" height="100" fill="#ff5710" />
    
    <path
      d="M 20 35 C 30 20, 70 20, 80 35"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />

    <text
      x="50"
      y="55"
      textAnchor="middle"
      fontSize="12"
      fontWeight="900"
      fill="white"
    >
      테니스포럼
    </text>

    <text
      x="50"
      y="68"
      textAnchor="middle"
      fontSize="6"
      fontWeight="500"
      fill="white"
    >
      구인·구직·커뮤니티
    </text>
  </svg>
);

export default DefaultPostIcon;