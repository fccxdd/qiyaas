// hooks/keyboard/UseKeyboardHandlers.tsx

// Handles error messages for vowels, consonants, etc.

import { useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import { getWordFromClue } from '@/hooks/clues/clueTypes';
import { DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';
import { ValidatedLetterState } from '@/hooks/clues/UseGameState';

interface UseKeyboardHandlersProps {
  selectedLetters: string;
  gameStarted: boolean;
  message: string;
  awaitingLetterType: 'vowel' | 'consonant' | null;
  pendingLetter: { vowel?: string; consonant?: string; };
  validatedAdditionalLetters: ValidatedLetterState;
  cluesData: DailyWordPuzzle;
  
  setSelectedLetters: (value: string | ((prev: string) => string)) => void;
  setAwaitingLetterType: (type: 'vowel' | 'consonant' | null) => void;
  setPendingLetter: (value: { vowel?: string; consonant?: string; } | ((prev: { vowel?: string; consonant?: string; }) => { vowel?: string; consonant?: string; })) => void;
  setValidatedAdditionalLetters: (value: ValidatedLetterState | ((prev: ValidatedLetterState) => ValidatedLetterState)) => void;
  setAdditionalLetters: (value: { vowel?: string; consonant?: string; } | ((prev: { vowel?: string; consonant?: string; }) => { vowel?: string; consonant?: string; })) => void;
  setHasAnyCorrectAdditionalLetter: (value: boolean) => void;
  setGameStarted: (value: boolean) => void;
  setLettersInClues: (value: Set<string>) => void;
  onStartingLettersSubmit?: () => void;
  
  showMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
  handleLifeLost: () => void;
  checkLettersInClues: (letters: string) => Set<string>;
}

export function useKeyboardHandlers({
  selectedLetters,
  gameStarted,
  message,
  awaitingLetterType,
  pendingLetter,
  validatedAdditionalLetters,
  cluesData,
  setSelectedLetters,
  setAwaitingLetterType,
  setPendingLetter,
  setValidatedAdditionalLetters,
  setAdditionalLetters,
  setHasAnyCorrectAdditionalLetter,
  setGameStarted,
  setLettersInClues,
  onStartingLettersSubmit,
  showMessage,
  handleLifeLost,
  checkLettersInClues,
}: UseKeyboardHandlersProps) {
  
  const handleKeyPress = useCallback((key: string) => {
    const upperKey = key.toUpperCase();
    const VOWELS = GameConfig.vowels;
    const isVowel = VOWELS.includes(upperKey);

    // If awaiting additional letter selection
    if (awaitingLetterType) {
      
      if (awaitingLetterType === 'vowel' && !isVowel) {
        showMessage(
          GameConfig.messages.additionalLetterWrongType
            ?.replace('{expected}', 'vowel (A, E, I, O, U)')
            .replace('{got}', 'consonant'),
          'error'
        );
        return;
      }
      if (awaitingLetterType === 'consonant' && isVowel) {
        showMessage(
          GameConfig.messages.additionalLetterWrongType
            ?.replace('{expected}', 'consonant')
            ?.replace('{got}', 'vowel'),
          'error'
        );
        return;
      }

      const allUsedLetters = [
        ...selectedLetters.split(''),
        validatedAdditionalLetters.vowel?.letter,
        validatedAdditionalLetters.consonant?.letter,
      ].filter(Boolean).map(l => l?.toUpperCase());

      if (allUsedLetters.includes(upperKey)) {
        showMessage(GameConfig.messages.additionalLetterAlreadyUsed, 'error');
        return;
      }

      setPendingLetter(prev => ({ ...prev, [awaitingLetterType]: upperKey }));
      showMessage(GameConfig.messages.confirmAdditionalLetter?.replace('{letter}', upperKey), 'info');
      return;
    }

    // Starting letter selection
    if (!gameStarted) {
      const currentLettersArray = selectedLetters.split('');
      
      if (message !== '' && !awaitingLetterType) return;
      
      if (currentLettersArray.includes(upperKey)) {
        showMessage(GameConfig.messages.letterAlreadySelected, 'error');
        return;
      }
      
      if (currentLettersArray.length >= 4) {
        showMessage(GameConfig.messages.maxLettersReached, 'error');
        return;
      }

      const vowelCount = currentLettersArray.filter(letter => VOWELS.includes(letter)).length;
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
  }, [
    selectedLetters, showMessage, gameStarted, message, 
    awaitingLetterType, validatedAdditionalLetters, 
    setPendingLetter, setSelectedLetters
  ]);

  const handleBackspace = useCallback(() => {
    if (awaitingLetterType) {
      if (awaitingLetterType === 'vowel') {
        if (pendingLetter.vowel) {
          setPendingLetter(prev => {
            const updated = { ...prev };
            delete updated.vowel;
            return updated;
          });
          showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', 'vowel'), 'info');
        } else if (validatedAdditionalLetters.vowel) {
          setValidatedAdditionalLetters(prev => {
            const updated = { ...prev };
            delete updated.vowel;
            return updated;
          });
          setAdditionalLetters(prev => {
            const updated = { ...prev };
            delete updated.vowel;
            return updated;
          });
          const remainingCorrect = validatedAdditionalLetters.consonant?.correct;
          setHasAnyCorrectAdditionalLetter(!!remainingCorrect);
          setAwaitingLetterType(null);
          showMessage('', 'info');
        } else {
          setAwaitingLetterType(null);
          showMessage('', 'info');
        }
      } else if (awaitingLetterType === 'consonant') {
        if (pendingLetter.consonant) {
          setPendingLetter(prev => {
            const updated = { ...prev };
            delete updated.consonant;
            return updated;
          });
          showMessage(GameConfig.messages.selectAdditionalLetter?.replace('{type}', 'consonant'), 'info');
        } else if (validatedAdditionalLetters.consonant) {
          setValidatedAdditionalLetters(prev => {
            const updated = { ...prev };
            delete updated.consonant;
            return updated;
          });
          setAdditionalLetters(prev => {
            const updated = { ...prev };
            delete updated.consonant;
            return updated;
          });
          const remainingCorrect = validatedAdditionalLetters.vowel?.correct;
          setHasAnyCorrectAdditionalLetter(!!remainingCorrect);
          setAwaitingLetterType(null);
          showMessage('', 'info');
        } else {
          setAwaitingLetterType(null);
          showMessage('', 'info');
        }
      } 
      return;
    }

    if (!gameStarted && message === '') {
      setSelectedLetters(prev => prev.slice(0, -1));
    }
  }, [
    gameStarted, message, awaitingLetterType, pendingLetter, 
    showMessage, validatedAdditionalLetters, setPendingLetter,
    setValidatedAdditionalLetters, setAdditionalLetters,
    setHasAnyCorrectAdditionalLetter, setAwaitingLetterType, setSelectedLetters
  ]);

  const handleEnter = useCallback(() => {
    // Confirm additional letter
    if (awaitingLetterType && pendingLetter[awaitingLetterType]) {
      const clueWords = [
        getWordFromClue(cluesData.clue_1)?.toUpperCase(),
        getWordFromClue(cluesData.clue_2)?.toUpperCase(),
        getWordFromClue(cluesData.clue_3)?.toUpperCase()
      ].filter(Boolean);

      const letterToValidate = pendingLetter[awaitingLetterType];
      const isCorrect = clueWords.some(word => word?.includes(letterToValidate));
      
      if (awaitingLetterType === 'vowel') {
        setValidatedAdditionalLetters(prev => ({
          ...prev,
          vowel: { letter: letterToValidate!, correct: isCorrect }
        }));
        
        setAdditionalLetters(prev => ({
          ...prev,
          vowel: letterToValidate
        }));

        const hasCorrect = isCorrect || validatedAdditionalLetters.consonant?.correct;
        setHasAnyCorrectAdditionalLetter(!!hasCorrect);

        if (!isCorrect) handleLifeLost();

        setPendingLetter(prev => {
          const updated = { ...prev };
          delete updated.vowel;
          return updated;
        });
      } else if (awaitingLetterType === 'consonant') {
        setValidatedAdditionalLetters(prev => ({
          ...prev,
          consonant: { letter: letterToValidate!, correct: isCorrect }
        }));
        
        setAdditionalLetters(prev => ({
          ...prev,
          consonant: letterToValidate
        }));

        const hasCorrect = validatedAdditionalLetters.vowel?.correct || isCorrect || validatedAdditionalLetters.consonant?.correct;
        setHasAnyCorrectAdditionalLetter(!!hasCorrect);

        if (!isCorrect) handleLifeLost();

        setPendingLetter(prev => {
          const updated = { ...prev };
          delete updated.consonant;
          return updated;
        });
      } 
      
      setAwaitingLetterType(null);
      showMessage('', 'info');
      return;
    }

    // Cancel awaiting state if no pending letter
    if (awaitingLetterType && !pendingLetter[awaitingLetterType]) {
      setAwaitingLetterType(null);
      showMessage('', 'info');
      return;
    }

    // Start the game
    if (!gameStarted && selectedLetters.length === GameConfig.startingLettersNumber) {
      if (message !== '') return;
      
      const inClues = checkLettersInClues(selectedLetters);
      setLettersInClues(inClues);
      setGameStarted(true);

      // Trigger color reveal animation
      onStartingLettersSubmit?.(); 
    } else if (!gameStarted && selectedLetters.length < GameConfig.startingLettersNumber) {
      showMessage(GameConfig.messages.noSelectedLetters, 'info');
    }
  }, [
    gameStarted, selectedLetters, showMessage, checkLettersInClues, 
    message, awaitingLetterType, pendingLetter, handleLifeLost, 
    cluesData, validatedAdditionalLetters, setValidatedAdditionalLetters,
    setAdditionalLetters, setHasAnyCorrectAdditionalLetter, setPendingLetter,
    setAwaitingLetterType, setLettersInClues, setGameStarted, onStartingLettersSubmit
  ]);

  const handleRequestAdditionalLetter = useCallback((type: 'vowel' | 'consonant' ) => {
    if (type === 'vowel') {
      const validatedLetter = validatedAdditionalLetters.vowel;
      if (validatedLetter) {
        setAwaitingLetterType(type);
        setPendingLetter(prev => ({
          ...prev,
          vowel: validatedLetter.letter
        }));
        showMessage(`Press Backspace to remove ${validatedLetter.letter}, or select a new letter`, 'info');
        return;
      }
    } else if (type === 'consonant') {
      const validatedLetter = validatedAdditionalLetters.consonant;
      if (validatedLetter) {
        setAwaitingLetterType(type);
        setPendingLetter(prev => ({
          ...prev,
          consonant: validatedLetter.letter
        }));
        showMessage(`Press Backspace to remove ${validatedLetter.letter}, or select a new letter`, 'info');
        return;
      }
    } 

    if (awaitingLetterType === type) {
      setAwaitingLetterType(null);
      setPendingLetter(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
      showMessage('', 'info');
      return;
    }

    setAwaitingLetterType(type);
    
    if (!pendingLetter[type]) {
      setPendingLetter(prev => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });
    }
   
    showMessage(
    GameConfig.messages.selectAdditionalLetter?.replace('{type}', type) || `Select a ${type} from the keyboard`,
    'info'
  );
  }, [
    validatedAdditionalLetters, showMessage, awaitingLetterType, 
    pendingLetter, setAwaitingLetterType, setPendingLetter
  ]);

  return {
    handleKeyPress,
    handleBackspace,
    handleEnter,
    handleRequestAdditionalLetter,
  };
}