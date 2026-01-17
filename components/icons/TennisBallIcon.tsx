import React from 'react';

interface TennisBallIconProps {
  className?: string;
}

const TennisBallIcon: React.FC<TennisBallIconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={`w-16 h-16 ${className}`}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="11" fill="#c8e639" />
    <path
      d="M 20 5.5 C 12 10, 12 14, 20 18.5"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 4 5.5 C 12 10, 12 14, 4 18.5"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export default TennisBallIcon;