// hooks/keyboard/useKeyboardInput.ts

'use client';

import { useEffect } from 'react';
import { useKeyboardArrowNavigation } from './useKeyboardArrowNavigation';
import { useLetterInput } from '@/hooks/clues/useLetterInput';
import { useBackspaceHandler } from './useBackspaceHandler';
import { useEnterKeyHandler } from './useEnterKeyHandler';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseKeyboardInputProps {
  isEnabled: boolean;
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  setUserInputs: React.Dispatch<React.SetStateAction<Map<string, Map<number, string>>>>;
  completedWords: Set<string>;
  verifiedPositions: Map<string, Set<number>>;
  cursorPosition: CursorPosition | null;
  setCursorPosition: (position: CursorPosition) => void;
  startingLettersSet: React.MutableRefObject<Set<string> | null>;
  submitWord: (clue: string, clueIndex: number) => void;
  onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
  moveToNextPosition: () => void;
  moveToPreviousPosition: () => void;
  moveToClueAbove: () => void;
  moveToClueBelow: () => void;
  additionalLetters ?: { vowel?: string; consonant?: string; };
  additionalLetterPositions: Map<string, Set<number>>;
}

export function useKeyboardInput({
  isEnabled,
  activeClues,
  userInputs,
  setUserInputs,
  completedWords,
  verifiedPositions,
  cursorPosition,
  setCursorPosition,
  startingLettersSet,
  submitWord,
  onShowMessage,
  moveToNextPosition,
  moveToPreviousPosition,
  moveToClueAbove,
  moveToClueBelow,
  additionalLetters,
  additionalLetterPositions

}: UseKeyboardInputProps) {
  
  // Arrow key navigation
  useKeyboardArrowNavigation({
    isEnabled,
    moveToNextPosition,
    moveToPreviousPosition,
    moveToClueAbove,
    moveToClueBelow
  });

  // Letter input handler
  const { handleLetterInput } = useLetterInput({
    activeClues,
    userInputs,
    setUserInputs,
    cursorPosition,
    setCursorPosition,
    verifiedPositions,
    startingLettersSet,
    moveToNextPosition
  });

  // Backspace handler
  const { handleBackspace } = useBackspaceHandler({
    activeClues,
    userInputs,
    setUserInputs,
    completedWords,
    verifiedPositions,
    cursorPosition,
    setCursorPosition,
    startingLettersSet,
     additionalLetterPositions
  });

  // Enter key handler
  const { handleEnter } = useEnterKeyHandler({
    activeClues,
    userInputs,
    cursorPosition,
    submitWord,
    onShowMessage
  });

  // Main keyboard event listener
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys are handled by useKeyboardArrowNavigation
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Handle Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
        return;
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Handle letter input
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleLetterInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, handleEnter, handleBackspace, handleLetterInput]);
}