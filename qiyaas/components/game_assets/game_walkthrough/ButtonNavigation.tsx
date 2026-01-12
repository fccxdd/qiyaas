// components/game_assets/game_walkthrough/ButtonNavigation.tsx

'use client';

import { useEffect, useRef } from 'react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';

interface ButtonNavigationProps {
  onClick: () => void;
}

export const NextButton = ({ onClick }: ButtonNavigationProps) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        onClick();
      }
    };

    // Swipe navigation - only on document, not on buttons
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartX.current - touchEndX.current;
      const timeDiff = Date.now() - touchStartTime.current;
      
      // Only trigger swipe if:
      // 1. Swipe distance > 50px
      // 2. Swipe took less than 300ms (quick swipe)
      // 3. Not touching a button element
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      
      if (diff > 50 && timeDiff < 300 && !isButton) {
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClick]);

  return (
    <button
      onClick={onClick}
      className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-xl sm:text-2xl h-12 sm:h-12 px-6 sm:px-5 w-[158px] whitespace-nowrap"
    >
      <NavigateNextIcon />
      Next
    </button>
  );
};

export const BackButton = ({ onClick }: ButtonNavigationProps) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onClick();
      }
    };

    // Swipe navigation - only on document, not on buttons
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartX.current - touchEndX.current;
      const timeDiff = Date.now() - touchStartTime.current;
      
      // Only trigger swipe if:
      // 1. Swipe distance > 50px
      // 2. Swipe took less than 300ms (quick swipe)
      // 3. Not touching a button element
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      
      if (diff < -50 && timeDiff < 300 && !isButton) {
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClick]);

  return (
    <button
      onClick={onClick}
      className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-xl sm:text-2xl h-12 sm:h-12 px-6 sm:px-5 w-[158px] whitespace-nowrap"
    >
      <NavigateBeforeIcon />
      Back
    </button>
  );
};

export const StartButton = ({ onClick }: ButtonNavigationProps) => {
  return (
    <button
      onClick={onClick}
      className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-green-600 text-white gap-2 hover:bg-green-700 dark:hover:bg-green-500 hover:-translate-y-1 hover:shadow-2xl font-medium text-xl sm:text-2xl h-12 sm:h-12 px-6 sm:px-5 w-[158px] whitespace-nowrap"
    >
      <PlayCircleFilledWhiteIcon />
      Play!
    </button>
  );
};