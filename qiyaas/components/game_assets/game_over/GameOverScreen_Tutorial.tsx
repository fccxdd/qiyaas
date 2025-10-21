// components/GameOverScreen_Tutorial.tsx

"use client"

import React from 'react';
import ReplayIcon from '@mui/icons-material/Replay';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import Image from 'next/image';

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
      <div className="relative text-center px-8 py-12 bg-white dark:bg-black rounded-3xl shadow-2xl max-w-md mx-4 animate-scale-in">
        
        {/* Winning Icon */}
        <div className="flex flex-col gap-[30px] row-start-2 items-center">
          
          <Image
            className="block dark:hidden"
            src="qiyaas_logo_66_percent.svg"
            alt="qiyaas-logo-light"
            width={178}
            height={151}
          />

          <Image
            className="hidden dark:block"
            src="qiyaas_logo.svg"
            alt="qiyaas-logo-dark"
            width={178}
            height={151}
          />
         
        </div>
        
        {/* Win Message */}
        <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4 ">
          GREAT JOB!
        </h1>
        
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          You have completed the tutorial!<br/>
          Ready for the real challenge?
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-6 items-center flex-col sm:flex-row">
          <button
            onClick={onGoToMainGame}
            className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            <SportsEsportsIcon/> Play Main Game
          </button>
          
          <button
            onClick={onPlayAgain}
            className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            <ReplayIcon/> Play Again
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
      <div className="relative text-center px-8 py-12 bg-white dark:bg-black rounded-3xl shadow-2xl max-w-md mx-4 animate-scale-in">

        {/* Game Over Icon */}
        <div className="flex flex-col gap-[30px] row-start-2 items-center">
          
          <Image
            className="dark:hidden block animate-pulse linear"
            src="/qiyaas_grey_light.svg"
            alt="qiyaas-greyed-out-light"
            width={178}
            height={151}
          />

           <Image
            className="not-dark:hidden block animate-pulse linear"
            src="/qiyaas_grey_dark.svg"
            alt="qiyaas-greyed-out-dark"
            width={178}
            height={151}
          />   

        </div>
        
        {/* Lose Message */}
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">
          GAME OVER!
        </h1>

        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          You didnt get it this time.<br/>
          Want to try again?
        </p>
                
        {/* Action Buttons */}
        <div className="flex gap-6 items-center flex-col sm:flex-row">
          <button
            onClick={onRetryTutorial}
            className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            <ReplayIcon/> Play Again
          </button>
          
          <button
            onClick={onGoToMainGame}
            className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            <SportsEsportsIcon/> Play Main Game
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