// components/GameOverScreen.tsx

"use client"

import React from 'react';
import ReplayIcon from '@mui/icons-material/Replay';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

interface WinScreenProps {
  onPlayAgain?: () => void;
  onGoToMainGame?: () => void;
}

interface LoseScreenProps {
  onRetryTutorial?: () => void;
  onGoToMainGame?: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ 
  onPlayAgain, 
  onGoToMainGame
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative text-center px-8 py-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md mx-4 border-4 border-green-400 animate-scale-in">
        
        {/* Celebration Icon */}
        <div className="mb-6">
          <div className="text-7xl animate-bounce">🎉</div>
        </div>
        
        {/* Win Message */}
        <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4 ">
          Congratulations!
        </h1>
        
        {/* <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          You have completed the tutorial!<br/>
          Ready for the real challenge?
        </p> */}
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onGoToMainGame}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg font-['Indie_Flower']"
          >
            🎮 Play Main Game
          </button>
          
          <button
            onClick={onPlayAgain}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg font-['Indie_Flower']"
          >
            🔄 Replay Tutorial
          </button>
        </div>
        
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
  onRetryTutorial, 
  onGoToMainGame
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative text-center px-8 py-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md mx-4  animate-scale-in">

        {/* Game Over Icon */}
        <div className="mb-6">
          {/* TODO: Replace heart-break icon with blacked out Qiyaas logo */}
          <div className="text-7xl animate-pulse">💔</div>
        </div>
        
        {/* Lose Message */}
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          GAME OVER!
        </h1>
                
        {/* Action Buttons */}
        <div className="flex gap-6 items-center flex-col sm:flex-row">
          <button
            onClick={onRetryTutorial}
            className="rounded-full shadow-xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:animate-bounce font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            <ReplayIcon/> Retry
          </button>
          
          <button
            onClick={onGoToMainGame}
            className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:animate-bounce font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            <SportsEsportsIcon/> Play
          </button>
        </div>
        
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