// hooks/keyboard/useKeyboardInput.ts

'use client';

import { useEffect, useRef } from 'react';
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
  additionalLetters?: { vowel?: string; consonant?: string; };
  additionalLetterPositions: Map<string, Set<number>>;
  isWordComplete: (clue: string, wordInputs: Map<number, string>) => boolean;
  autoRevealedPositions?: Map<string, Set<number>>;
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
  additionalLetterPositions,
  isWordComplete,
  autoRevealedPositions = new Map(),
}: UseKeyboardInputProps) {
  
  // Track composition state for mobile keyboards (important for iOS/Android)
  const isComposingRef = useRef(false);
  
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
    onShowMessage,
    isWordComplete
  });

  // Main keyboard event listener - optimized for mobile
  useEffect(() => {
    if (!isEnabled || !cursorPosition) return;

    // Check if current position is locked
    const currentClue = activeClues[cursorPosition.clueIndex];
    const autoRevealed = autoRevealedPositions.get(currentClue);
    const isCurrentPositionLocked = autoRevealed?.has(cursorPosition.position) || false;

    // Handle composition events for mobile keyboards
    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = (e: CompositionEvent) => {
      isComposingRef.current = false;
      
      // Don't process if position is locked
      if (isCurrentPositionLocked) return;
      
      // Process the composed character immediately
      const key = e.data?.toUpperCase();
      if (key && /^[A-Z]$/.test(key)) {
        handleLetterInput(key);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process keys during composition (mobile IME)
      if (isComposingRef.current) return;

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
        
        // If current position is locked, move to previous instead of deleting
        if (isCurrentPositionLocked) {
          moveToPreviousPosition();
          return;
        }
        
        handleBackspace();
        return;
      }

      // Handle letter input
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        
        // Don't allow input on locked positions
        if (isCurrentPositionLocked) {
          return;
        }
        
        handleLetterInput(key);
      }
    };

    // Add all event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('compositionstart', handleCompositionStart);
    window.addEventListener('compositionend', handleCompositionEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('compositionstart', handleCompositionStart);
      window.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [
    isEnabled,
    cursorPosition,
    activeClues,
    autoRevealedPositions,
    handleEnter,
    handleBackspace,
    handleLetterInput,
    moveToPreviousPosition
  ]);
}