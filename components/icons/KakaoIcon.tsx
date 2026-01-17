import React from 'react';

const KakaoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 4.64c-6.96 0-12.64 4.48-12.64 10.08 0 3.52 2.32 6.64 5.76 8.48l-1.84 6.72 6.96-4.64c.64.08 1.28.08 1.92.08 6.96 0 12.64-4.48 12.64-10.08S22.96 4.64 16 4.64z"
      fill="currentColor"
    />
  </svg>
);

export default KakaoIcon;