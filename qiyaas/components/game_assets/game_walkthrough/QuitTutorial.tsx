// components/game_assets/game_walkthrough/QuitTutorial.tsx

'use client';

import { useState, useEffect } from 'react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { useRouter } from 'next/navigation';

export default function QuitTutorial() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Disable swipe-to-navigate on iOS Safari
    const metaTag = document.createElement('meta');
    metaTag.name = 'apple-mobile-web-app-capable';
    metaTag.content = 'yes';
    document.head.appendChild(metaTag);

    // Disable pull-to-refresh and overscroll effects
    document.body.style.overscrollBehavior = 'none';
    
    // Push a fake history state immediately
    const currentUrl = window.location.href;
    window.history.pushState({ page: 'tutorial-play', preventBack: true }, '', currentUrl);

    // Track if we've already shown the modal to prevent duplicates
    let hasShownModal = false;

    const handlePopState = (e: PopStateEvent) => {
      if (!hasShownModal) {
        e.preventDefault?.();
        
        // Immediately push state again to stay on the page
        window.history.pushState({ page: 'tutorial-play', preventBack: true }, '', currentUrl);
        
        // Show the modal
        setShowModal(true);
        hasShownModal = true;
        
        // Reset after modal interaction
        setTimeout(() => {
          hasShownModal = false;
        }, 500);
      }
    };

    // Prevent touch gestures that could trigger navigation
    const preventGestures = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX < 10 || touch.clientX > window.innerWidth - 10) {
        e.preventDefault();
      }
    };

    // Intercept keyboard shortcuts for back navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Left Arrow (Windows) or Cmd+Left Arrow (Mac) - Back navigation
      if ((e.altKey && e.key === 'ArrowLeft') || (e.metaKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        setShowModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', preventGestures, { passive: false });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', preventGestures);
      document.body.style.overscrollBehavior = 'auto';
      document.head.removeChild(metaTag);
    };
  }, []);

  const handleLeaveClick = () => {
    setShowModal(true);
  };

  const handleConfirmLeave = () => {
    window.removeEventListener('popstate', () => {});
    router.push('/how-to-play');
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleLeaveClick}
        className="cursor-pointer rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center gap-2 bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 sm:h-11 px-3 sm:px-6"
        aria-label="Leave Tutorial"
      >
        <IoMdArrowRoundBack className="text-lg sm:text-xl" />
        <span className="hidden sm:inline text-sm font-medium">Back</span>
      </button>

      {/* Modal */}
      {showModal && (
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
              Are you sure you want to go back to the tutorial?
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
                onClick={handleConfirmLeave}
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