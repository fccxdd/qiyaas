// hooks/clues/UseGameState.tsx

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  getPuzzleDate,
  DailyWordPuzzle,
  usePuzzleData
} from '@/components/game_assets/word_clues/ExtractAnswer';
import { GameConfig } from '@/lib/gameConfig';
import { useGameStorage } from '@/hooks/clues/useGameStorage';
import { getWordFromClue } from '@/hooks/clues/clueTypes';

export interface AdditionalLettersState {
  vowel?: string;
  consonant?: string;
}

export interface ValidatedLetterState {
  vowel?: { letter: string; correct: boolean };
  consonant?: { letter: string; correct: boolean };
}

export interface GameState {
  lives: number;
  selectedLetters: string;
  additionalLetters: AdditionalLettersState;
  validatedAdditionalLetters: ValidatedLetterState;
  hasAnyCorrectAdditionalLetter: boolean;
  awaitingLetterType: 'vowel' | 'consonant' | null;
  pendingLetter: { vowel?: string; consonant?: string; };
  message: string;
  messageType: 'error' | 'success' | 'info';
  gameStarted: boolean;
  lettersInClues: Set<string>;
  isGameOver: boolean;
  hasWon: boolean;
  wordInputs: Map<string, string>;
  verifiedInputs: Map<string, string>;
  hintsEnabled: boolean;
  cluesData: DailyWordPuzzle;
}

export function useGameState() {
  // Fetch puzzle data from API
  const { puzzle: apiPuzzle, loading: puzzleLoading } = usePuzzleData();
  
  // Get the current puzzle date for the storage hook
  const puzzleDate = apiPuzzle?.date || getPuzzleDate();
  const { loadGameState, saveGameState, clearGameState } = useGameStorage(puzzleDate);
  
  const [lives, setLives] = useState(GameConfig.maxLives);
  const [selectedLetters, setSelectedLetters] = useState('');
  const [additionalLetters, setAdditionalLetters] = useState<AdditionalLettersState>({});
  const [validatedAdditionalLetters, setValidatedAdditionalLetters] = useState<ValidatedLetterState>({});
  const [hasAnyCorrectAdditionalLetter, setHasAnyCorrectAdditionalLetter] = useState(false);
  const [awaitingLetterType, setAwaitingLetterType] = useState<'vowel' | 'consonant' | null>(null);
  const [pendingLetter, setPendingLetter] = useState<{ vowel?: string; consonant?: string; }>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');
  const [gameStarted, setGameStarted] = useState(false);
  const [lettersInClues, setLettersInClues] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [wordInputs, setWordInputs] = useState<Map<string, string>>(new Map());
  const [verifiedInputs, setVerifiedInputs] = useState<Map<string, string>>(new Map());
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  
  // Use API puzzle data
  const [cluesData, setCluesData] = useState<DailyWordPuzzle>(apiPuzzle);
  const hasInitializedClues = useRef(false);
  const [solvedClues, setSolvedClues] = useState<boolean[]>([false, false, false]);
  
  // Update clues when API data changes
  useEffect(() => {
    if (!puzzleLoading && apiPuzzle) {
      setCluesData(apiPuzzle);
      hasInitializedClues.current = true;
    }
  }, [apiPuzzle, puzzleLoading]);

  const numbersForClue = cluesData?.numbers_for_clue ?? [];

  const clueWordsArray = useMemo(() => {
    if (!cluesData) return [];
    return [
      getWordFromClue(cluesData.clue_1),
      getWordFromClue(cluesData.clue_2),
      getWordFromClue(cluesData.clue_3)
    ].filter(Boolean) as string[];
  }, [cluesData]);

  // Load game state from localStorage on mount (after puzzle loads)
  useEffect(() => {
    if (puzzleLoading || !apiPuzzle) return; // Wait for puzzle to load
    
    const savedState = loadGameState();
    if (savedState && savedState.cluesData && savedState.puzzleDate === puzzleDate) {
      
      setLives(savedState.lives);
      setSelectedLetters(savedState.selectedLetters);
      setAdditionalLetters(savedState.additionalLetters);
      setValidatedAdditionalLetters(savedState.validatedAdditionalLetters);
      setHasAnyCorrectAdditionalLetter(savedState.hasAnyCorrectAdditionalLetter);
      setGameStarted(savedState.gameStarted);
      setLettersInClues(new Set(savedState.lettersInClues || []));
      setWordInputs(new Map(savedState.wordInputs || []));
      setVerifiedInputs(new Map(savedState.verifiedInputs || []));
      
      // Save State
      if (savedState.solvedClues) {
        setSolvedClues(savedState.solvedClues);
      }

      if (typeof savedState.hintsEnabled !== 'undefined') {
        setHintsEnabled(savedState.hintsEnabled);
      }
      
      setCluesData(savedState.cluesData);
      hasInitializedClues.current = true;
      setIsGameOver(savedState.isGameOver || false);
      setHasWon(savedState.hasWon || false);
    } else {
      console.log('🆕 No saved state or new puzzle, using fresh API data');
      setCluesData(apiPuzzle);
      hasInitializedClues.current = true;
    }
    setHasLoadedFromStorage(true);
  }, [loadGameState, puzzleLoading, apiPuzzle, puzzleDate]);

  // Auto-save game state to localStorage whenever key state changes
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    if (isGameOver) return;
    if (puzzleLoading) return;
    
    const stateToSave = {
      lives,
      selectedLetters,
      additionalLetters,
      validatedAdditionalLetters,
      hasAnyCorrectAdditionalLetter,
      gameStarted,
      lettersInClues: Array.from(lettersInClues),
      wordInputs: Array.from(wordInputs.entries()),
      verifiedInputs: Array.from(verifiedInputs.entries()),
      cluesData,
      isGameOver,
      hasWon,
      letterStatus: {} as Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>,
      hintsEnabled,
      puzzleDate,
      solvedClues,
      timestamp: Date.now()
    };
    
    saveGameState(stateToSave);
  }, [
    lives, selectedLetters, additionalLetters, validatedAdditionalLetters,
    hasAnyCorrectAdditionalLetter, gameStarted, lettersInClues, wordInputs,
    verifiedInputs, cluesData, isGameOver, hasWon, hintsEnabled,
    hasLoadedFromStorage, saveGameState, puzzleDate, puzzleLoading, solvedClues
  ]);

  const handleLifeLost = useCallback(() => {
    setLives(prev => Math.max(0, prev - 1));
  }, []);

  const handleWin = useCallback(() => {
    setTimeout(() => {
      setIsGameOver(true);
      setHasWon(true);
    }, GameConfig.duration.gameOverScreenDelay);
  }, []);

  const showMessage = useCallback((msg: string, type: 'error' | 'success' | 'info' = 'error') => {
    setMessage(msg);
    setMessageType(type);
  }, []);

  const handleMessageClose = useCallback(() => {
    setMessage('');
  }, []);

  const checkLettersInClues = useCallback((letters: string) => {
    const lettersArray = letters.split('');
    const inClues = new Set<string>();
    
    const clueWords = [
      getWordFromClue(cluesData.clue_1)?.toUpperCase(),
      getWordFromClue(cluesData.clue_2)?.toUpperCase(),
      getWordFromClue(cluesData.clue_3)?.toUpperCase()
    ].filter(Boolean);

    lettersArray.forEach(letter => {
      const upperLetter = letter.toUpperCase();
      if (clueWords.some(word => word?.includes(upperLetter))) {
        inClues.add(upperLetter);
      }
    });

    return inClues;
  }, [cluesData]);

  const handlePlayAgain = useCallback(() => {
    // Clear the saved state for this puzzle
    clearGameState();
    
    // Reset all game state to initial values
    setLives(GameConfig.maxLives);
    setSelectedLetters('');
    setAdditionalLetters({});
    setValidatedAdditionalLetters({});
    setHasAnyCorrectAdditionalLetter(false);
    setAwaitingLetterType(null);
    setPendingLetter({});
    setMessage('');
    setGameStarted(false);
    setLettersInClues(new Set());
    setIsGameOver(false);
    setHasWon(false);
    setWordInputs(new Map());
    setVerifiedInputs(new Map());
    setSolvedClues([false, false, false]);
    
    // Reload from API
    setCluesData(apiPuzzle);
  }, [clearGameState, apiPuzzle]);

  // Monitor lives and trigger game over
  useEffect(() => {
    if (lives === 0 && !isGameOver) {
      setTimeout(() => {
        setIsGameOver(true);
        setHasWon(false);
        clearGameState();
      }, GameConfig.duration.gameOverScreenDelay);
    }
  }, [lives, isGameOver, clearGameState]);

  return {
    // State
    lives,
    selectedLetters,
    additionalLetters,
    validatedAdditionalLetters,
    hasAnyCorrectAdditionalLetter,
    awaitingLetterType,
    pendingLetter,
    message,
    messageType,
    gameStarted,
    lettersInClues,
    isGameOver,
    setIsGameOver,
    hasWon,
    wordInputs,
    verifiedInputs,
    hintsEnabled,
    cluesData,
    numbersForClue,
    clueWordsArray,
    hasLoadedFromStorage,
    puzzleDate,
    puzzleLoading, // Expose loading state
    solvedClues,
    
    // Setters
    setLives,
    setSelectedLetters,
    setAdditionalLetters,
    setValidatedAdditionalLetters,
    setHasAnyCorrectAdditionalLetter,
    setAwaitingLetterType,
    setPendingLetter,
    setMessage,
    setGameStarted,
    setLettersInClues,
    setWordInputs,
    setVerifiedInputs,
    setHintsEnabled,
    setSolvedClues,
    
    // Handlers
    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues,
    handlePlayAgain,
  };
}