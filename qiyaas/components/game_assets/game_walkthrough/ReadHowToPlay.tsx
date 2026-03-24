// components/game_assets/game_walkthrough/ReadHowToPlay.tsx

'use client';
import { useState, useRef, useEffect } from "react";
import { IoBook } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { TutorialGameInstructions } from "@/data/tutorialGameSteps";

type Props = {
  variant?: 'howToPlay' | 'play';
  gameStarted?: boolean;
  hasLoadedFromStorage?: boolean;
  onModalClose?: () => void;
};

type Slide = {
  id: number;
  title?: string;
  content?: string;
  component?: React.ComponentType | React.ReactNode;
  variants?: {
    howToPlay: { title: string; content: string };
    play: { title: string; content: string };
  };
};

export default function ReadHowToPlay({ variant = 'howToPlay', gameStarted = false, hasLoadedFromStorage = false, onModalClose }: Props) {

  const [showModal, setShowModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const resolvedSlides = TutorialGameInstructions.map(slide =>
    slide.variants ? { ...slide, ...slide.variants[variant] } : slide
  ) as Slide[];
  const slide = resolvedSlides[currentSlide];

  useEffect(() => {
    if (variant === 'howToPlay') {
      setShowModal(true);
      return;
    }
    if (hasLoadedFromStorage && !gameStarted) {
      setShowModal(true);
    }
  }, [hasLoadedFromStorage]);

  const handleOpenModal = () => {
    setCurrentSlide(0);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onModalClose?.();
  };

  const handleNext = () => {
    if (currentSlide < resolvedSlides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleCloseModal();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const isLast = currentSlide === resolvedSlides.length - 1;

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="cursor-pointer rounded-full shadow-xl border border-solid border-transparent transform transition-transform flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 w-8 sm:h-9 sm:w-9"
        aria-label="Help"
      >
        <IoBook className="text-xl sm:text-2xl" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-10 max-w-lg w-full relative flex flex-col items-center gap-6"
            key={currentSlide}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={handleCloseModal}
              className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <IoMdClose className="text-xl sm:text-2xl text-black dark:text-white" />
            </button>

            <div className="text-center flex flex-col gap-3 min-h-[120px] justify-center px-2">
              <h2
                className="text-2xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug"
                dangerouslySetInnerHTML={{ __html: slide.title ?? '' }}
              />
              {slide.content ? (
                <p
                  className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: slide.content ?? '' }}
                />
              ) : null}
              {slide.component && (
                <div className="mt-5 flex justify-center">
                  {typeof slide.component === 'function'
                    ? (() => { const C = slide.component as React.ComponentType; return <C />; })()
                    : slide.component
                  }
                </div>
              )}
            </div>

            <div className="flex gap-1.5">
              {resolvedSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === currentSlide
                      ? "w-5 bg-gray-800 dark:bg-purple-500"
                      : "w-2 bg-gray-300 dark:bg-white"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 w-full justify-between">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}