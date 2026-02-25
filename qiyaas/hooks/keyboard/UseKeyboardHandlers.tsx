// hooks/keyboard/UseKeyboardHandlers.tsx

// Handles error messages for vowels, consonants, etc.

import { useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface UseKeyboardHandlersProps {
  selectedLetters: string;
  gameStarted: boolean;
  message: string;

  setSelectedLetters: (value: string | ((prev: string) => string)) => void;
  setGameStarted: (value: boolean) => void;
  setLettersInClues: (value: string[]) => void;
  onStartingLettersSubmit?: () => void;

  showMessage: (msg: string, type?: 'error' | 'success' | 'info', persist?: boolean) => void;
  handleLifeLost: () => void;
  checkLettersInClues: (letters: string) => string[];
}

export function useKeyboardHandlers({
  selectedLetters,
  gameStarted,
  message,
  setSelectedLetters,
  setGameStarted,
  setLettersInClues,
  onStartingLettersSubmit,
  showMessage,
  checkLettersInClues,
}: UseKeyboardHandlersProps) {

  const handleKeyPress = useCallback((key: string) => {
    const upperKey = key.toUpperCase();
    const VOWELS = GameConfig.vowels;
    const isVowel = VOWELS.includes(upperKey);

    if (!gameStarted) {
      const currentLettersArray = selectedLetters.split('');

      if (selectedLetters.length === 0 && message === GameConfig.messages.startingLettersMessage) {
        showMessage('', 'info', false);
      }

      if (currentLettersArray.includes(upperKey)) {
        showMessage(GameConfig.messages.letterAlreadySelected, 'error');
        return;
      }

      if (currentLettersArray.length >= 4) {
        showMessage(GameConfig.messages.maxLettersReached, 'error');
        return;
      }

      const vowelCount = currentLettersArray.filter(l => VOWELS.includes(l)).length;
      const consonantCount = currentLettersArray.length - vowelCount;

      if (isVowel && vowelCount >= 1) {
        showMessage(GameConfig.messages.onlyOneVowel, 'error');
        return;
      }

      if (!isVowel && consonantCount >= 3) {
        showMessage(GameConfig.messages.onlyThreeConsonants, 'error');
        return;
      }

      setSelectedLetters(prev => prev + upperKey);
    }
  }, [selectedLetters, showMessage, gameStarted, setSelectedLetters, message]);

  const handleBackspace = useCallback(() => {
    if (!gameStarted) {
      setSelectedLetters(prev => prev.slice(0, -1));
    }
  }, [gameStarted, setSelectedLetters]);

  const handleEnter = useCallback(() => {
    if (!gameStarted && selectedLetters.length === GameConfig.startingLettersNumber) {
      const inClues = checkLettersInClues(selectedLetters);
      setLettersInClues(inClues);
      setGameStarted(true);
      onStartingLettersSubmit?.();
    } else if (!gameStarted && selectedLetters.length < GameConfig.startingLettersNumber) {
      showMessage(GameConfig.messages.noSelectedLetters, 'info');
    }
  }, [gameStarted, selectedLetters, showMessage, checkLettersInClues, setLettersInClues, setGameStarted, onStartingLettersSubmit]);

  return {
    handleKeyPress,
    handleBackspace,
    handleEnter,
  };
}