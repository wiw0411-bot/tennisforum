import React from 'react';

const AppLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
    className={className}
    aria-hidden="true"
  >
    <circle cx="20" cy="20" r="19" fill="#fff8f5" stroke="#ff5710" strokeWidth="2" />
    <path
      d="M 5 20 C 15 5, 25 35, 35 20"
      stroke="#ff5710"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="20"
      y="20"
      textAnchor="middle"
      dominantBaseline="central"
      fill="#ff5710"
      fontSize="14"
      fontWeight="bold"
      fontFamily="Pretendard, sans-serif"
    >
      TC
    </text>
  </svg>
);

export default AppLogoIcon;
