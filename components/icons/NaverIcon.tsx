import React from 'react';

const NaverIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.273 12.845 7.727 0H0v24h7.727V11.155L16.273 24H24V0h-7.727v12.845z" fill="currentColor"/>
  </svg>
);

export default NaverIcon;