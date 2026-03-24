"use client";

import React, { useEffect, useRef, useState } from 'react';
import hintMap from '@/data/hint_map.json';
import { GameConfig } from '@/lib/gameConfig';
import PulseGlow from '@/hooks/hint_toggle/pulseGlow';
import HintHighlighter from '@/hooks/hint_toggle/useHintHighlighter';
import HintVisibilityManager from '@/hooks/hint_toggle/useHintVisibility';

interface HintToggleProps {
  hintsEnabled?: boolean;
  solvedClues?: boolean[];
  isGameOver?: boolean;
  onHintsRevealed?: () => void;
  hintsRevealComplete?: boolean;
  hasWon?: boolean;
  numbersForClue: number[];
  wordTypes: string[];
  ruleTypes: string[];
  puzzleDate?: string;
  // Tutorial: 'number' dims alpha+value, 'alpha' dims number+value, 'value' dims number+alpha
  spotlightColumn?: 'number' | 'alpha' | 'value' | null;
  onAllHintsOpened?: () => void;
  autoOpenAll?: boolean;
}

const HintToggle: React.FC<HintToggleProps> = ({
  hintsEnabled = true,
  solvedClues = [false, false, false],
  isGameOver,
  onHintsRevealed,
  hintsRevealComplete = false,
  hasWon = false,
  numbersForClue,
  wordTypes,
  ruleTypes,
  puzzleDate = '',
  spotlightColumn = null,
  onAllHintsOpened,
  autoOpenAll = false,
}) => {
  const [revealedHints, setRevealedHints] = useState<boolean[]>([false, false, false]);
  const [everOpened, setEverOpened] = useState<boolean[]>([false, false, false]);
  const hasRevealedRef = useRef(hintsRevealComplete);

  useEffect(() => {
    hasRevealedRef.current = hintsRevealComplete;
  }, [hintsRevealComplete]);

  useEffect(() => {
    if (!isGameOver || !hasWon) return;
    if (hasRevealedRef.current || hintsRevealComplete) {
      setRevealedHints([true, true, true]);
      return;
    }
    setRevealedHints([false, false, false]);
    const TRANSITION_DURATION = 400;
    const STAGGER = [1400, 2600, 3900];
    const LAST_HINT_DONE = STAGGER[2] + TRANSITION_DURATION;
    const timers = [
      setTimeout(() => setRevealedHints(prev => [true, prev[1], prev[2]]), STAGGER[0]),
      setTimeout(() => setRevealedHints(prev => [prev[0], true, prev[2]]), STAGGER[1]),
      setTimeout(() => setRevealedHints(prev => [prev[0], prev[1], true]), STAGGER[2]),
      setTimeout(() => {
        hasRevealedRef.current = true;
        onHintsRevealed?.();
      }, LAST_HINT_DONE + 100),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, [isGameOver, hasWon]);

  useEffect(() => {
    if (!isGameOver || hasWon) return;
    if (hasRevealedRef.current || hintsRevealComplete) return;
    if (!solvedClues.every(s => s)) return;
    setTimeout(() => {
      hasRevealedRef.current = true;
      onHintsRevealed?.();
    }, 500);
  }, [isGameOver, hasWon, solvedClues, hintsRevealComplete]);

  useEffect(() => {
    if (!isGameOver) setRevealedHints([false, false, false]);
  }, [isGameOver]);

  const getBackgroundColor = (type?: string) => {
    if (!type) return '';
    switch (type.toUpperCase()) {
      case 'NOUN':      return GameConfig.wordColors_bg.noun;
      case 'VERB':      return GameConfig.wordColors_bg.verb;
      case 'ADJECTIVE': return GameConfig.wordColors_bg.adjective;
      default:          return '';
    }
  };

  const getWordTypeColor = (type?: string) => {
    if (!type) return GameConfig.wordColors.default;
    switch (type.toUpperCase()) {
      case 'NOUN':      return GameConfig.wordColors.noun;
      case 'VERB':      return GameConfig.wordColors.verb;
      case 'ADJECTIVE': return GameConfig.wordColors.adjective;
      default:          return GameConfig.wordColors.default;
    }
  };

  const getHoverColor = (type?: string) => {
    if (!type) return 'hover:text-green-700 dark:hover:text-green-400';
    return 'hover:opacity-80';
  };

  return (
    <HintVisibilityManager
      numbersForClue={numbersForClue}
      puzzleDate={puzzleDate}
      hintsEnabled={hintsEnabled}
      solvedClues={solvedClues}
      isGameOver={isGameOver}
      autoOpenAll={autoOpenAll}
    >
      {({ hintsVisible, hintsOpacity, toggleHint: baseToggleHint }) => {

        const toggleHint = (index: number) => {
          if (!hintsVisible[index]) {
            // Opening a hint
            baseToggleHint(index);
            const next = [...everOpened];
            next[index] = true;
            setEverOpened(next);
            if (next.every(Boolean)) onAllHintsOpened?.();
          } else if (!autoOpenAll) {
            // Only allow closing when autoOpenAll is not active
            baseToggleHint(index);
          }
        };

        return (
        <div className="hint-container flex flex-col justify-center items-start relative">
          {numbersForClue.map((number, index) => {
            const wordType = wordTypes[index];
            const ruleType = ruleTypes[index];
            const isSolved = solvedClues[index];
            const colorClass = getWordTypeColor(wordType);
            const hoverClass = getHoverColor(wordType);
            const hintText = hintMap[number.toString() as keyof typeof hintMap] || '';

            const isHintVisible = (isGameOver && hasWon && revealedHints[index]) || hintsVisible[index];
            const isHintOpaque = (isGameOver && hasWon && revealedHints[index]) || hintsOpacity[index];

            // Dim this row's number if spotlightColumn targets alpha or value
            const isNumberDimmed = spotlightColumn === 'alpha' || spotlightColumn === 'value';

            return (
              <div
                key={index}
                className="hint-wrapper-row flex items-center relative"
              >
                <PulseGlow
                  enabled={hintsEnabled && !isHintVisible && !isGameOver}
                  onInteraction={() => !isGameOver && toggleHint(index)}
                  className={`hint-number relative z-10 transition-all duration-500 ease-in-out rounded-lg ${
                    (ruleType === 'length_rule' && isSolved)
                      ? `${getBackgroundColor(wordType)} ${GameConfig.hintMappingColors} px-2 py-1 rounded font-bold`
                      : `${colorClass} font-bold`
                  } ${
                    (hintsEnabled || isSolved) && !isGameOver
                      ? `${hoverClass} hover:scale-110 active:scale-95 cursor-pointer`
                      : 'cursor-default'
                  } ${isNumberDimmed ? 'opacity-20' : ''}`}
                  style={{ fontFamily: 'Indie Flower' }}
                >
                  {number}
                </PulseGlow>

                {isHintVisible && (
                  <div
                    onClick={() => !isGameOver && toggleHint(index)}
                    className={`hint-text rounded backdrop-blur-sm z-50 whitespace-nowrap tracking-tighter sm:tracking-normal ${
                      isGameOver
                        ? 'cursor-default duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                        : 'cursor-pointer duration-500 ease-out'
                    } transition-all ${colorClass} ${
                      isHintOpaque ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                    }`}
                    style={{ fontFamily: 'Indie Flower', fontWeight: 'bold' }}
                  >
                    <HintHighlighter
                      hintText={hintText}
                      ruleType={ruleType}
                      wordType={wordType}
                      isSolved={isSolved}
                      hintNumber={number.toString()}
                      spotlightColumn={spotlightColumn}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        );
      }}
    </HintVisibilityManager>
  );
};

export default HintToggle;