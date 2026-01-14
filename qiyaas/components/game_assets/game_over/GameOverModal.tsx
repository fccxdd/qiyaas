// components/game_over/GameOverModal.tsx

"use client"

import React, { ReactNode } from 'react';
import { IoMdClose } from "react-icons/io";

interface GameOverModalProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  children: ReactNode;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ 
  onClose, 
  showCloseButton = true,
  children 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative text-center px-4 py-8 sm:px-8 sm:py-12 bg-white dark:bg-black rounded-3xl shadow-2xl max-w-[280px] sm:max-w-md mx-4 animate-scale-in">
        
        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
              className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Closing"
            >
              <IoMdClose className="text-xl sm:text-2xl text-black dark:text-white" />
          </button>
        )}

        {children}
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