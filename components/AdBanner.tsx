import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { Advertisement } from '../types';

interface AdBannerProps {
  advertisements: Advertisement[];
}

const AdBanner: React.FC<AdBannerProps> = ({ advertisements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const autoScrollTimer = useRef<number | null>(null);
  
  const activeAds = advertisements.filter(ad => ad.isActive);

  const goNext = useCallback(() => {
    if (activeAds.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeAds.length);
    }
  }, [activeAds.length]);

  const goPrev = useCallback(() => {
    if (activeAds.length > 1) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + activeAds.length) % activeAds.length);
    }
  }, [activeAds.length]);

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
  };

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (activeAds.length > 1) {
      autoScrollTimer.current = window.setTimeout(goNext, 5000);
    }
  }, [goNext, activeAds.length]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [currentIndex, startAutoScroll]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoScroll();
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50; // Swipe threshold in pixels

    if (diff > threshold) {
      goNext();
    } else if (diff < -threshold) {
      goPrev();
    } else {
      startAutoScroll();
    }
  };

  const handleButtonClick = (action: 'prev' | 'next') => {
    stopAutoScroll();
    if(action === 'prev') goPrev();
    else goNext();
  };
  
  const handleAdClick = (url?: string) => {
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (activeAds.length === 0) {
    return null; // Don't render banner if there are no active ads
  }

  return (
    <div className="mb-4 relative">
      <div 
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeAds.map((card) => (
            <div key={card.id} className="w-full flex-shrink-0 p-1.5">
              <div 
                onClick={() => handleAdClick(card.linkUrl)}
                className="rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.2)] overflow-hidden relative h-28 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${card.imageUrl})`,
                  cursor: card.linkUrl ? 'pointer' : 'default',
                }}
              >
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {activeAds.length > 1 && (
        <>
          <button
            onClick={() => handleButtonClick('prev')}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 transition-opacity duration-300 z-10 hover:bg-black/50"
            aria-label="Previous Ad"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={() => handleButtonClick('next')}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 transition-opacity duration-300 z-10 hover:bg-black/50"
            aria-label="Next Ad"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}
    </div>
  );
};

export default AdBanner;