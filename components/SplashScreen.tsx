import React, { useEffect, useState } from 'react';
import { splashAdImage } from '../assets/imageAssets';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 5000);

    const countdownTimer = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearTimeout(finishTimer);
      clearInterval(countdownTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white z-50 animate-fade-in">
      <img 
        src={splashAdImage}
        alt="Tennis Advertisement"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
        {countdown}
      </div>
    </div>
  );
};

export default SplashScreen;