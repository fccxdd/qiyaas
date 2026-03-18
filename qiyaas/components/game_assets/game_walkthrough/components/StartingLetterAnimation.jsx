// components/game_assets/game_walkthrough/components/StartingLetterAnimation.jsx

'use client';

import { useEffect, useState } from 'react';
import { GameConfig } from '@/lib/gameConfig';

const DEMO_LETTERS = 'RSTE';
const IN_CLUE_LETTERS = ['R', 'S', 'E']; // T → grey, R/S/E → green

const TYPE_DELAY         = 500; // ms between each letter appearing
const REVEAL_START_DELAY = 600; // ms pause after last letter before color reveal begins

export default function StartingLetterAnimation({
  letters       = DEMO_LETTERS,
  inClueLetters = IN_CLUE_LETTERS,
  loop          = false,
  loopDelay     = 2000,
}) {
  const [typedCount,     setTypedCount]     = useState(0);
  const [revealedColors, setRevealedColors] = useState([]); // indices that have been color-revealed

  const bounceDelay = GameConfig.duration.startingLetterBounceDelay; // 1000ms stagger between reveals

  useEffect(() => {
    let timeouts = [];

    const run = () => {
      setTypedCount(0);
      setRevealedColors([]);

      // Phase 1: type letters in one by one
      letters.split('').forEach((_, i) => {
        const t = setTimeout(() => {
          setTypedCount(i + 1);
        }, 300 + i * TYPE_DELAY);
        timeouts.push(t);
      });

      // Phase 2: reveal colors staggered by bounceDelay
      const revealStart = 300 + letters.length * TYPE_DELAY + REVEAL_START_DELAY;
      letters.split('').forEach((_, i) => {
        const t = setTimeout(() => {
          setRevealedColors(prev => [...prev, i]);
        }, revealStart + i * bounceDelay);
        timeouts.push(t);
      });

      // Phase 3: loop if requested
      if (loop) {
        const totalTime = revealStart + letters.length * bounceDelay + loopDelay;
        const t = setTimeout(run, totalTime);
        timeouts.push(t);
      }
    };

    run();
    return () => timeouts.forEach(clearTimeout);
  }, [letters, loop, loopDelay, bounceDelay]);

  return (
    <div className="flex flex-col items-center gap-3">
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes color-reveal {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="flex gap-3 sm:gap-4">
        {Array.from({ length: GameConfig.startingLettersNumber }).map((_, index) => {
          const letter      = letters[index];
          const isTyped     = index < typedCount;
          const isRevealed  = revealedColors.includes(index);
          const letterUpper = letter?.toUpperCase();
          const isInClue    = inClueLetters.includes(letterUpper);

          // Empty dashed slot — not yet typed
          if (!isTyped || !letter) {
            return (
              <div
                key={`empty-${index}`}
                className={`starting-letter-slot rounded-full border-2 border-dashed ${GameConfig.startingColors.beforeGameBegins} flex items-center justify-center`}
              />
            );
          }

          const bgColor = isRevealed
            ? (isInClue ? GameConfig.startingColors.inClue : GameConfig.startingColors.notInClue)
            : GameConfig.startingColors.default;

          // color-reveal bounce is keyed by a changing key so it replays each time
          // Background color snaps instantly (no transition) — the bounce is the visual feedback
          return (
            <div
              key={isRevealed ? `revealed-${index}` : `typed-${index}`}
              className={`starting-letter-slot rounded-full flex items-center justify-center ${bgColor}`}
              style={{
                animation: isRevealed
                  ? `color-reveal ${bounceDelay}ms ease-out`
                  : 'scale-in 0.2s ease-out',
              }}
            >
              <span className={`${GameConfig.startingColors.lettersText} starting-letter-text font-bold uppercase`}>
                {letter}
              </span>
            </div>
          );
        })}
      </div>

      <p className="message-text text-center text-gray-500 dark:text-gray-400">
        <span className="font-bold text-gray-500 dark:text-gray-400">Grey</span> = not in any words &nbsp;·&nbsp; <span className="font-bold text-green-500">Green</span> = in the words
      </p>
    </div>
  );
}