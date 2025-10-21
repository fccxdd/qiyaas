// components/game_assets/lives/LifeBar.tsx

"use client"

import React, { useState, useEffect } from 'react';

interface LifeBarProps {
  lives: number;
  maxLives?: number;
  onLifeLost?: () => void;
}

const LifeBar: React.FC<LifeBarProps> = ({ 
  lives, 
  maxLives = 5,
  onLifeLost 
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [previousLives, setPreviousLives] = useState(lives);

  // Trigger shake animation when life is lost
  useEffect(() => {
    if (lives < previousLives) {
      setIsShaking(true);
      onLifeLost?.();
      
      // Remove shake animation after duration
      setTimeout(() => {
        setIsShaking(false);
      }, 600);
    }
    setPreviousLives(lives);
  }, [lives, previousLives, onLifeLost]);

  return (

    	<div className="flex justify-end top-4 right-4 z-20">
      <div className={`flex gap-2 ${isShaking ? 'animate-shake' : ''}`}>
        {Array.from({ length: maxLives }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full transition-all duration-300 ${
              index < (maxLives - lives)
                ? 'bg-gray-700 dark:bg-gray-300 scale-75 opacity-30'
                : 'bg-purple-500 dark:shadow-lg dark:shadow-purple-500/50'
            }`}
          />
        ))}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
};

export default LifeBar;