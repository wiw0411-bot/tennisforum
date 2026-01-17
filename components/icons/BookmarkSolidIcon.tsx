import React from 'react';

const BookmarkSolidIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path d="M5 4.5a2.5 2.5 0 015 0v2.086a2.5 2.5 0 01-5 0V4.5z" />
        <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v13a1.5 1.5 0 01-2.438 1.156L10 14.897l-4.562 2.76A1.5 1.5 0 013 16.5v-13z" clipRule="evenodd" />
    </svg>
);

export default BookmarkSolidIcon;