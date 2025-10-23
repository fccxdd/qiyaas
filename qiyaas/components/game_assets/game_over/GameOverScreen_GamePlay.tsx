// components/GameOverScreen_GamePlay.tsx

"use client"

import React, { useEffect } from 'react';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import { markTodayAsPlayed } from '@/components/game_assets/game_over/dailyGameTracker';

interface WinScreenProps {
  onClose?: () => void;
}

interface LoseScreenProps {
  onClose?: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ 
  onClose
}) => {
  // Mark as played when win screen shows
  useEffect(() => {
    markTodayAsPlayed();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative text-center px-4 py-8 sm:px-8 sm:py-12 bg-white dark:bg-black rounded-3xl shadow-2xl max-w-[280px] sm:max-w-md mx-4 animate-scale-in">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        )}

        {/* Celebration Icon */}
        <div className="flex flex-col gap-[20px] sm:gap-[30px] row-start-2 items-center">
          
          <Image
            className="block animate-bounce linear"
            src="/qiyaas_logo.svg"
            alt="qiyaas-logo"
            width={140}
            height={119}
          />
         
        </div>
        
        {/* Win Message */}
        <h1 className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-3 sm:mb-4">
          GREAT JOB!
        </h1>
        
        <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
          You have completed todays game!<br/>
          Come back tomorrow for another chance to win!
        </p>
        
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export const LoseScreen: React.FC<LoseScreenProps> = ({ 
  onClose
}) => {
  // Mark as played when lose screen shows
  useEffect(() => {
    markTodayAsPlayed();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative text-center px-4 py-8 sm:px-8 sm:py-12 bg-white dark:bg-black rounded-3xl shadow-2xl max-w-[280px] sm:max-w-md mx-4 animate-scale-in">

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        )}

        {/* Game Over Icon */}
        <div className="flex flex-col gap-[20px] sm:gap-[30px] row-start-2 items-center">
          
          <Image
            className="dark:hidden block animate-pulse linear"
            src="/qiyaas_grey_light.svg"
            alt="qiyaas-greyed-out-light"
            width={140}
            height={119}
          />

           <Image
            className="not-dark:hidden block animate-pulse linear"
            src="/qiyaas_grey_dark.svg"
            alt="qiyaas-greyed-out-dark"
            width={140}
            height={119}
          />        
        </div>
        
        {/* Lose Message */}
        <h1 className="text-2xl sm:text-4xl font-bold text-red-600 dark:text-red-400 mb-3 sm:mb-4">
          GAME OVER!
        </h1>

        <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
          You didnt get it this time.<br/>
          Come back tomorrow for another chance to win!
        </p>

      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};