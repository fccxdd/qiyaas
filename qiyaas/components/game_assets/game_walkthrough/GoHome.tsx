// components/game_mode/tutorial/GoHome.tsx

'use client';

import { useState } from 'react';
import { IoMdHome } from "react-icons/io";
import { useRouter } from 'next/navigation';

interface GoHomeProps {
  showConfirmation?: boolean;
  onNavigate?: () => void;
  navigateTo?: string;
}

export default function GoHome({ 
  showConfirmation = false, 
  onNavigate,
  navigateTo = '/'
}: GoHomeProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleHomeClick = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      handleNavigation();
    }
  };

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      router.push(navigateTo);
    }
  };

  const handleConfirmHome = () => {
    setShowModal(false);
    handleNavigation();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleHomeClick}
        className="cursor-pointer rounded-full h-7 w-7 sm:h-9 sm:w-9 shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl z-50"
        aria-label="Go Home"
      >
        <IoMdHome className="text-lg sm:text-2xl" />
      </button>

      {/* Modal */}
      {showConfirmation && showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4">
              Are you sure you want to go home?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              All progress will not be saved.
            </p>
            
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={handleCancel}
                className="cursor-pointer flex-1 rounded-full shadow-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-all px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:-translate-y-1 hover:shadow-xl"
              >
                No
              </button>
              <button
                onClick={handleConfirmHome}
                className="cursor-pointer flex-1 rounded-full shadow-lg border border-solid border-transparent transition-all px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-xl"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}