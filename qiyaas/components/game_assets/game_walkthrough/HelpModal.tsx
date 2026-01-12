// components/game_assets/game_walkthrough/HelpModal.tsx

'use client';

import { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { IoHelp } from "react-icons/io5";
import KeyboardPreview from '@/components/game_assets/game_walkthrough/components/KeyboardPreview';
import { GameConfig } from '@/lib/gameConfig';

export default function HelpModal() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="cursor-pointer rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 w-8 sm:h-9 sm:w-9"
        aria-label="Help"
      >
        <IoHelp className="text-xl sm:text-2xl" />
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <IoMdClose className="text-xl sm:text-2xl text-black dark:text-white" />
            </button>

            {/* Modal content */}
            <div className="text-center">
              <h2 className="text-xl sm:text-3xl font-bold text-black dark:text-white mb-3 sm:mb-6 pr-6">
                How to Play
              </h2>

              <div className="text-left space-y-3 sm:space-y-6">
                {/* Game objective */}
                <div>
                  <h3 className="text-base sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2 text-center">
                    Guess the <span className={`${GameConfig.wordColors.noun}`}>n</span>oun, <span className={`${GameConfig.wordColors.verb}`}>v</span>erb, and <span className={`${GameConfig.wordColors.adjective}`}>a</span>djective
                  </h3>
                  <br/>
                  <h4 className="text-black dark:text-white font-bold text-base sm:text-xl text-center">
                    Numbers = clues
                  </h4>
                </div>

                {/* Examples section */}
                <div className="rounded-lg sm:rounded-xl p-2 sm:p-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-3xl">
                    {/* Left column - words */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                        <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>S</span><span className="text-xl sm:text-3xl">MART</span>
                        <h3 className={`${GameConfig.wordColors.adjective} text-lg sm:text-2xl`}>a</h3>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                        <span className={`${GameConfig.wordColors_bg.verb} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>A</span><span className="text-xl sm:text-3xl">RRIVE</span>
                        <h3 className={`${GameConfig.wordColors.verb} text-lg sm:text-2xl`}>v</h3>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                        <span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xl sm:text-3xl font-bold`}>HONEY</span>
                        <h3 className={`${GameConfig.wordColors.noun} text-lg sm:text-2xl`}>n</h3>
                      </div>
                    </div>

                    {/* Right column - clues */}
                    <div className="space-y-1.5 sm:space-y-2 text-black dark:text-white text-xl sm:text-3xl text-center">
                      <div>7 = G , <span className={`${GameConfig.wordColors_bg.adjective} inline-block text-white px-1.5 sm:px-2 py-0.5 rounded text-sxl sm:text-3xl`}>S</span></div>
                      <div>1 = <span className={`${GameConfig.wordColors_bg.verb} inline-block  text-white px-1.5 sm:px-2 py-0.5 rounded text-xl sm:text-3xl`}>A</span> , O</div>
                      <div><span className={`${GameConfig.wordColors_bg.noun} inline-block text-white px-1.5 sm:px-2 py-0.5 rounded text-xl sm:text-3xl`}>5</span> = E , F</div>
                    </div>
                  </div>
                </div>

                {/* Keyboard explanation */}
                <div className="rounded-lg sm:rounded-xl p-2 sm:p-4">
                    <h3 className="text-base sm:text-xl font-semibold text-black dark:text-white mb-2 sm:mb-2 text-center underline">Keyboard Rules</h3>
                  <div className="flex items-center justify-center mb-0">
                    <div className="scale-90 sm:scale-100 origin-center">
                      <KeyboardPreview />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-black dark:text-white text-xs sm:text-base mb-2 sm:mb-4 text-center">
                    To start, select some letters based on the clues provided.<br/>
                    Reason and guess to solve the puzzle.
                  </h4>
                </div>

                {/* TimeZone */}
                <div>
                  <h6 className="text-purple-600 dark:text-purple-400 text-xs sm:text-base mb-2 sm:mb-4 text-center italic">
                    NOTE: Qiyaas updates daily at Midnight EST/EDT.
                  </h6>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}