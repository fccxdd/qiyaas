// hooks/clues/UseGameState.tsx

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { getPuzzleDate, DailyWordPuzzle, usePuzzleData } from '@/components/game_assets/word_clues/ExtractAnswer';
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
  hasLostLifeForNoStartingLetters: boolean;
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
  hasRevealedOnLoss: boolean;
  silentRevealedWords: Set<string>;
  revealedStartingColors: Set<number>;
  hasStartingLettersAnimationCompleted: boolean;
  hasAdditionalLettersAnimationCompleted: {
    vowel: boolean;
    consonant: boolean;
  };
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
  const [hasLostLifeForNoStartingLetters, setHasLostLifeForNoStartingLetters] = useState(false); 
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
  
  // State for nested structures
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [verifiedPositions, setVerifiedPositions] = useState<Map<string, Set<number>>>(new Map());
  const [userInputsNested, setUserInputsNested] = useState<Map<string, Map<number, string>>>(new Map());
  
  // State for revealed sequence letters
  const [revealedSequenceLetters, setRevealedSequenceLetters] = useState<Map<string, Map<number, string>>>(new Map());

  // State for cursor position
  const [cursorPosition, setCursorPosition] = useState<{ clueIndex: number; position: number } | null>(null);

  // Track if we've revealed on loss to prevent double reveals
  const [hasRevealedOnLoss, setHasRevealedOnLoss] = useState(false);
  
  // Track silent revealed words
  const [silentRevealedWords, setSilentRevealedWords] = useState<Set<string>>(new Set());
  
  // Track auto-revealed positions
  const [autoRevealedPositions, setAutoRevealedPositions] = useState<Map<string, Set<number>>>(new Map());

  // Track starting letter color reveal state
  const [revealedStartingColors, setRevealedStartingColors] = useState<Set<number>>(new Set());

  // Track animation completion states
  const [hasStartingLettersAnimationCompleted, setHasStartingLettersAnimationCompleted] = useState(false);
  const [hasAdditionalLettersAnimationCompleted, setHasAdditionalLettersAnimationCompleted] = useState({
    vowel: false,
    consonant: false
  });

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
  
  // Use verifiedInputs directly for keyboard - it already contains all submitted letters
  // The issue is just the key format, so we don't need a separate computed value
  // verifiedInputs is populated by ClueGameManager when Enter is pressed

  // Load game state from localStorage on mount (after puzzle loads)
  useEffect(() => {
    if (puzzleLoading || !apiPuzzle) return;
    
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
      
      // Load hasLostLifeForNoStartingLetters
      if (savedState.hasLostLifeForNoStartingLetters !== undefined) {
        setHasLostLifeForNoStartingLetters(savedState.hasLostLifeForNoStartingLetters);
      }

      // Save State
      if (savedState.solvedClues) {
        setSolvedClues(savedState.solvedClues);
      }

      // Load completedWords from saved state
      if (savedState.completedWords) {
        setCompletedWords(new Set(savedState.completedWords));
      }
      
      // Load hasRevealedOnLoss from saved state
      if (savedState.hasRevealedOnLoss !== undefined) {
        setHasRevealedOnLoss(savedState.hasRevealedOnLoss);
      }
      
      // Load silentRevealedWords from saved state
      if (savedState.silentRevealedWords) {
        setSilentRevealedWords(new Set(savedState.silentRevealedWords));
      }
      
      // Load autoRevealedPositions from saved state
      if (savedState.autoRevealedPositions) {
        const autoRevealedMap = new Map<string, Set<number>>();
        savedState.autoRevealedPositions.forEach(([clue, positions]) => {
          autoRevealedMap.set(clue, new Set(positions));
        });
        setAutoRevealedPositions(autoRevealedMap);
      }

      // Load verifiedPositions from saved state
      let positionsMap: Map<string, Set<number>> | undefined;
      if (savedState.verifiedPositions) {
        positionsMap = new Map<string, Set<number>>();
        savedState.verifiedPositions.forEach(([clue, positions]) => {
          positionsMap!.set(clue, new Set(positions));
        });
        setVerifiedPositions(positionsMap);
      }
      
      // Load userInputsNested from saved state
      let nestedMap: Map<string, Map<number, string>> | undefined;
      if (savedState.userInputsNested) {
        nestedMap = new Map<string, Map<number, string>>();
        savedState.userInputsNested.forEach(([clue, positionEntries]) => {
          nestedMap!.set(clue, new Map(positionEntries));
        });
        setUserInputsNested(nestedMap);
      }
      
      // Load revealedSequenceLetters from saved state
      if (savedState.revealedSequenceLetters) {
        const revealedMap = new Map<string, Map<number, string>>();
        savedState.revealedSequenceLetters.forEach(([clue, positions]) => {
          revealedMap.set(clue, new Map(positions));
        });
        setRevealedSequenceLetters(revealedMap);
      }

      // Rebuild verifiedInputs to include ALL verified letters
      // This includes BOTH correct (in verifiedPositions) AND incorrect (verified but wrong)
      // We need to track which positions have been verified through Enter key press
      if (positionsMap && nestedMap) {
        
        const rebuiltVerifiedInputs = new Map<string, string>();
        
        // Strategy: verifiedInputs in saved state already contains ALL verified letters
        // (both correct and incorrect), so we should use it directly if available
        if (savedState.verifiedInputs && savedState.verifiedInputs.length > 0) {
          // Use the saved verifiedInputs directly - it already has everything
          savedState.verifiedInputs.forEach(([key, letter]) => {
            rebuiltVerifiedInputs.set(key, letter);
          });
        } else {
          // Fallback: rebuild from verifiedPositions (only has correct letters)
          positionsMap.forEach((positions, clue) => {
            const userInputMap = nestedMap!.get(clue);
            
            if (userInputMap) {
              positions.forEach(position => {
                const letter = userInputMap.get(position);
                if (letter) {
                  const key = `${clue}-${position}`;
                  rebuiltVerifiedInputs.set(key, letter);
                }
              });
            }
          });
        }
        
        setVerifiedInputs(rebuiltVerifiedInputs);
      } else {
        // Fallback to old format if available
        const fallback = new Map(savedState.verifiedInputs || []);
        setVerifiedInputs(fallback);
      }

      if (typeof savedState.hintsEnabled !== 'undefined') {
        setHintsEnabled(savedState.hintsEnabled);
      }
      
      if (savedState.cursorPosition !== undefined) {
          setCursorPosition(savedState.cursorPosition);
      }

      // Load revealedStartingColors from saved state
      if (savedState.revealedStartingColors) {
        setRevealedStartingColors(new Set(savedState.revealedStartingColors));
      }

      // Load hasStartingLettersAnimationCompleted from saved state
      if (savedState.hasStartingLettersAnimationCompleted !== undefined) {
        setHasStartingLettersAnimationCompleted(savedState.hasStartingLettersAnimationCompleted);
      }

      // Load hasAdditionalLettersAnimationCompleted from saved state
      if (savedState.hasAdditionalLettersAnimationCompleted) {
        setHasAdditionalLettersAnimationCompleted(savedState.hasAdditionalLettersAnimationCompleted);
      }
      
      setCluesData(savedState.cluesData);
      hasInitializedClues.current = true;
      setIsGameOver(savedState.isGameOver || false);
      setHasWon(savedState.hasWon || false);
    } else {
      setCluesData(apiPuzzle);
      hasInitializedClues.current = true;
    }
    setHasLoadedFromStorage(true);
    
  }, [loadGameState, puzzleLoading, apiPuzzle, puzzleDate]);

  // Auto-save game state to localStorage whenever key state changes
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    if (puzzleLoading) return;
    
    // Convert verifiedPositions Map to Array for JSON serialization
    const verifiedPositionsArray: Array<[string, number[]]> = [];
    verifiedPositions.forEach((positions, clue) => {
      verifiedPositionsArray.push([clue, Array.from(positions)]);
    });
    
    // Convert userInputsNested Map<string, Map<number, string>> to Array
    const userInputsNestedArray: Array<[string, Array<[number, string]>]> = [];
    userInputsNested.forEach((positionMap, clue) => {
      userInputsNestedArray.push([clue, Array.from(positionMap.entries())]);
    });
    
    // Convert revealedSequenceLetters Map to Array
    const revealedSequenceLettersArray: Array<[string, Array<[number, string]>]> = [];
    revealedSequenceLetters.forEach((positionMap, clue) => {
      revealedSequenceLettersArray.push([clue, Array.from(positionMap.entries())]);
    });
    
    // Convert autoRevealedPositions Map to Array
    const autoRevealedPositionsArray: Array<[string, number[]]> = [];
    autoRevealedPositions.forEach((positions, clue) => {
      autoRevealedPositionsArray.push([clue, Array.from(positions)]);
    });
    
    const stateToSave = {
      lives,
      selectedLetters,
      additionalLetters,
      validatedAdditionalLetters,
      hasAnyCorrectAdditionalLetter,
      hasLostLifeForNoStartingLetters,
      gameStarted,
      lettersInClues: Array.from(lettersInClues),
      wordInputs: Array.from(wordInputs.entries()),
      verifiedInputs: Array.from(verifiedInputs.entries()),
      completedWords: Array.from(completedWords),
      verifiedPositions: verifiedPositionsArray,
      userInputsNested: userInputsNestedArray,
      revealedSequenceLetters: revealedSequenceLettersArray,
      autoRevealedPositions: autoRevealedPositionsArray,
      cursorPosition,
      cluesData,
      isGameOver,
      hasWon,
      hasRevealedOnLoss,
      silentRevealedWords: Array.from(silentRevealedWords),
      letterStatus: {} as Record<string, 'correct' | 'partial' | 'incorrect' | 'unused'>,
      hintsEnabled,
      puzzleDate,
      solvedClues,
      
      // Save starting letter colors
      revealedStartingColors: Array.from(revealedStartingColors),
      
      // Save animation completion states
      hasStartingLettersAnimationCompleted,
      hasAdditionalLettersAnimationCompleted,
      
      timestamp: Date.now()
    };
        
    saveGameState(stateToSave);
  }, [
    lives, selectedLetters, additionalLetters, validatedAdditionalLetters,
    hasAnyCorrectAdditionalLetter, hasLostLifeForNoStartingLetters, gameStarted, lettersInClues, wordInputs,
    verifiedInputs, completedWords, verifiedPositions, userInputsNested, revealedSequenceLetters,
    cursorPosition, cluesData, isGameOver, hasWon, hintsEnabled,
    hasLoadedFromStorage, saveGameState, puzzleDate, puzzleLoading, solvedClues,
    hasRevealedOnLoss, silentRevealedWords, autoRevealedPositions,
    revealedStartingColors,
    hasStartingLettersAnimationCompleted,
    hasAdditionalLettersAnimationCompleted
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

    // Reset Cursor Position
    setCursorPosition(null);

    // Reset all game state to initial values
    setLives(GameConfig.maxLives);
    setSelectedLetters('');
    setAdditionalLetters({});
    setValidatedAdditionalLetters({});
    setHasAnyCorrectAdditionalLetter(false);
    setHasLostLifeForNoStartingLetters(false);
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
    setCompletedWords(new Set());
    setVerifiedPositions(new Map());
    setUserInputsNested(new Map());
    setRevealedSequenceLetters(new Map());
    setHasRevealedOnLoss(false);
    setSilentRevealedWords(new Set());
    setAutoRevealedPositions(new Map());
    
    // Reset animation states
    setRevealedStartingColors(new Set());
    setHasStartingLettersAnimationCompleted(false);
    setHasAdditionalLettersAnimationCompleted({ vowel: false, consonant: false });
    
    // Reload from API
    setCluesData(apiPuzzle);
  }, [clearGameState, apiPuzzle]);

  // Stable callback wrapper for setHasLostLifeForNoStartingLetters
  const handleSetHasLostLifeForNoStartingLetters = useCallback((value: boolean) => {
    setHasLostLifeForNoStartingLetters(value);
  }, []);

  // Monitor lives and trigger game over
  useEffect(() => {
    if (lives === 0 && !isGameOver) {
      setTimeout(() => {
        setIsGameOver(true);
        setHasWon(false);
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
    hasLostLifeForNoStartingLetters,
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
    puzzleLoading,
    solvedClues,
    completedWords,
    verifiedPositions,
    userInputsNested,
    revealedSequenceLetters,
    cursorPosition,
    silentRevealedWords,
    autoRevealedPositions,
       
    // Animation states
    revealedStartingColors,
    hasStartingLettersAnimationCompleted,
    hasAdditionalLettersAnimationCompleted,
    
    // Setters
    setLives,
    setSelectedLetters,
    setAdditionalLetters,
    setValidatedAdditionalLetters,
    setHasAnyCorrectAdditionalLetter,
    setHasLostLifeForNoStartingLetters: handleSetHasLostLifeForNoStartingLetters,
    setAwaitingLetterType,
    setPendingLetter,
    setMessage,
    setGameStarted,
    setLettersInClues,
    setWordInputs,
    setVerifiedInputs,
    setHintsEnabled,
    setSolvedClues,
    setCompletedWords,
    setVerifiedPositions,
    setUserInputsNested,
    setRevealedSequenceLetters,
    setCursorPosition,
    setSilentRevealedWords,
    setAutoRevealedPositions,
    
    // Animation setters
    setRevealedStartingColors,
    setHasStartingLettersAnimationCompleted,
    setHasAdditionalLettersAnimationCompleted,
    
    // Handlers
    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues,
    handlePlayAgain,

    // Loss Reveal
    hasRevealedOnLoss,
    setHasRevealedOnLoss,
  };
}