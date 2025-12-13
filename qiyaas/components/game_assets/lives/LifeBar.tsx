// components/game_assets/lives/LifeBar.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { GameConfig } from '@/lib/gameConfig';

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
    <>
      <style jsx>{`
        /* Standard Breakpoints for life dot sizing */
        
        /* Mobile devices (320px — 480px) */
         @media (max-width: 480px) {
          .life-dot {
            width: 0.75rem;
            height: 0.75rem;
          }
          .life-container {
            gap: 0.5rem;
          }
        }

        /* iPads, Tablets (481px — 768px) */
        @media screen and (min-width: 481px) and (max-width: 768px) {
          .life-dot {
            width: 0.875rem;
            height: 0.875rem;
          }
          .life-container {
            gap: 0.5rem;
          }
        }
        
        /* Small screens, laptops - 13-inch (769px — 1024px) */
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          .life-dot {
            width: 1rem;
            height: 1rem;
          }
          .life-container {
            gap: 0.5rem;
          }
        }
        
        /* Desktops, large screens - 15-inch+ (1025px — 1280px) */
        @media screen and (min-width: 1025px) and (max-width: 1280px) {
          .life-dot {
            width: 1.125rem;
            height: 1.125rem;
          }
          .life-container {
            gap: 0.5rem;
          }
        }
        
        /* Extra large screens (1281px and more) */
        @media screen and (min-width: 1281px) {
          .life-dot {
            width: 1.25rem;
            height: 1.25rem;
          }
          .life-container {
            gap: 0.5rem;
          }
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>
      
      <div className="flex justify-center w-full mt-4 mb-2 z-20">
        <div className={`life-container flex ${isShaking ? 'animate-shake' : ''}`}>
          {Array.from({ length: maxLives }, (_, index) => (
            <div
              key={index}
              className={`life-dot rounded-full transition-all duration-300 ${
                index < (maxLives - lives)
                  ? GameConfig.livesColors.lost
                  : GameConfig.livesColors.full
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default LifeBar;