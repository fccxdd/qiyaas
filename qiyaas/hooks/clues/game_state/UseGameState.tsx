// hooks/UseGameState.tsx

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getPuzzleDate, usePuzzleData, DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';
import { GameConfig } from '@/lib/gameConfig';
import { useGameStorage } from '@/hooks/clues/game_state/useGameStorage';
import { getWordFromClue } from '@/hooks/clues/clueTypes';

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGameState() {
  const { puzzle: apiPuzzle, loading: puzzleLoading } = usePuzzleData();
  const puzzleDate = apiPuzzle?.date || getPuzzleDate();
  const { loadGameState, saveGameState, cleanOldKeys } = useGameStorage(puzzleDate);

  // ── Core game state ───────────────────────────────────────────────────────

  const [lives, setLives] = useState(GameConfig.maxLives);
  const [selectedLetters, setSelectedLetters] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasRevealedOnLoss, setHasRevealedOnLoss] = useState(false);
  const [hasLostLifeForNoStartingLetters, setHasLostLifeForNoStartingLetters] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(true);

  // ── Message state ─────────────────────────────────────────────────────────

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info');
  const [messagePersist, setMessagePersist] = useState(true);

  // ── Puzzle data ───────────────────────────────────────────────────────────

  const [cluesData, setCluesData] = useState<DailyWordPuzzle>(apiPuzzle);

  // ── Word state — parallel arrays, index = clue index ─────────────────────

  const [wordInputs, setWordInputs] = useState<(string | null)[][]>([[], [], []]);
  const [verified, setVerified] = useState<boolean[][]>([[], [], []]);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [sequenceRevealed, setSequenceRevealed] = useState<(string | null)[][]>([[], [], []]);
  const [silentRevealed, setSilentRevealed] = useState<boolean[]>([false, false, false]);
  const [hintsRevealComplete, setHintsRevealComplete] = useState(false);
  // submittedGuesses[clueIndex] = all valid words the user has submitted for that clue.
  // Persisted so keyboard colors survive refresh.
  const [submittedGuesses, setSubmittedGuesses] = useState<string[][]>([[], [], []]);

  // ── UI state ──────────────────────────────────────────────────────────────

  const [cursorPosition, setCursorPosition] = useState<{ clueIndex: number; position: number } | null>(null);
  const [solvedClues, setSolvedClues] = useState<boolean[]>([false, false, false]);
  const [lettersInClues, setLettersInClues] = useState<string[]>([]);
  const [revealedStartingColors, setRevealedStartingColors] = useState<number[]>([]);
  const [hasStartingLettersAnimationCompleted, setHasStartingLettersAnimationCompleted] = useState(false);

  // ── Load/save guards ──────────────────────────────────────────────────────

  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────

  const clueWordsArray = useMemo(() => {
    if (!cluesData) return [];
    return [
      getWordFromClue(cluesData.clue_1),
      getWordFromClue(cluesData.clue_2),
      getWordFromClue(cluesData.clue_3),
    ].filter(Boolean) as string[];
  }, [cluesData]);

  const numbersForClue = cluesData?.numbers_for_clue ?? [];

  // ── Clean up old storage keys on mount ───────────────────────────────────

  useEffect(() => {
    cleanOldKeys();
  }, [cleanOldKeys]);

  // ── Update cluesData when API responds ────────────────────────────────────

  useEffect(() => {
    if (!puzzleLoading && apiPuzzle && !hasLoadedFromStorage) {
      setCluesData(apiPuzzle);
    }
  }, [apiPuzzle, puzzleLoading, hasLoadedFromStorage]);

  // ── Load from storage ─────────────────────────────────────────────────────

  useEffect(() => {
    if (puzzleLoading || !apiPuzzle) return;

    const saved = loadGameState();

    if (saved) {
      setLives(saved.lives);
      setSelectedLetters(saved.selectedLetters);
      setGameStarted(saved.gameStarted);
      setIsGameOver(saved.isGameOver);
      setHasWon(saved.hasWon);
      setHasRevealedOnLoss(saved.hasRevealedOnLoss);
      setHasLostLifeForNoStartingLetters(saved.hasLostLifeForNoStartingLetters);
      setHintsEnabled(saved.hintsEnabled ?? true);
      setWordInputs(saved.wordInputs);
      setVerified(saved.verified);
      setCompleted(saved.completed);
      setSequenceRevealed(saved.sequenceRevealed);
      setSilentRevealed(saved.silentRevealed);
      setCursorPosition(saved.cursorPosition ?? null);
      setSolvedClues(saved.solvedClues);
      setLettersInClues(saved.lettersInClues);
      setRevealedStartingColors(saved.revealedStartingColors);
      setHasStartingLettersAnimationCompleted(saved.hasStartingLettersAnimationCompleted);
      setCluesData(saved.cluesData);
      setSubmittedGuesses(saved.submittedGuesses ?? [[], [], []]);
      setHintsRevealComplete(saved.hintsRevealComplete ?? false);
    } else {
      setCluesData(apiPuzzle);
      const words = [
        getWordFromClue(apiPuzzle.clue_1),
        getWordFromClue(apiPuzzle.clue_2),
        getWordFromClue(apiPuzzle.clue_3),
      ].filter(Boolean) as string[];
      setWordInputs(words.map(w => Array(w.length).fill(null)));
      setVerified(words.map(w => Array(w.length).fill(false)));
    }

    setHasLoadedFromStorage(true);
  }, [puzzleLoading, apiPuzzle, loadGameState]);

// ── Starting message ──────────────────────────────────────────────────────

useEffect(() => {
  if (!hasLoadedFromStorage || gameStarted) return;

  if (selectedLetters.length < GameConfig.startingLettersNumber) {
    setMessage(GameConfig.messages.startingLettersMessage);
    setMessageType('info');
    setMessagePersist(true);
  } else if (selectedLetters.length === GameConfig.startingLettersNumber) {
    setMessage(GameConfig.messages.confirmStartingLetters);
    setMessageType('info');
    setMessagePersist(true);
  }
}, [hasLoadedFromStorage, gameStarted, selectedLetters.length]);

  // ── Auto-save ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasLoadedFromStorage || puzzleLoading || !cluesData) return;

    saveGameState({
      puzzleDate,
      timestamp: Date.now(),
      lives,
      selectedLetters,
      gameStarted,
      isGameOver,
      hasWon,
      hasRevealedOnLoss,
      hasLostLifeForNoStartingLetters,
      wordInputs,
      verified,
      completed,
      sequenceRevealed,
      silentRevealed,
      cursorPosition,
      hintsEnabled,
      solvedClues,
      lettersInClues,
      revealedStartingColors,
      hasStartingLettersAnimationCompleted,
      cluesData,
      submittedGuesses,
      hintsRevealComplete
    });
  }, [
    hasLoadedFromStorage, puzzleLoading, puzzleDate,
    lives, selectedLetters, gameStarted, isGameOver, hasWon,
    hasRevealedOnLoss, hasLostLifeForNoStartingLetters,
    wordInputs, verified, completed, sequenceRevealed, silentRevealed,
    cursorPosition, hintsEnabled, solvedClues, lettersInClues,
    revealedStartingColors, hasStartingLettersAnimationCompleted,
    cluesData, saveGameState, submittedGuesses, hintsRevealComplete
  ]);

  // ── Game over on 0 lives ──────────────────────────────────────────────────

  useEffect(() => {
    if (lives === 0 && !isGameOver) {
      setTimeout(() => {
        setIsGameOver(true);
        setHasWon(false);
      }, GameConfig.duration.gameOverScreenDelay);
    }
  }, [lives, isGameOver]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLifeLost = useCallback(() => {
    setLives(prev => Math.max(0, prev - 1));
  }, []);

  const handleWin = useCallback(() => {
    setTimeout(() => {
      setIsGameOver(true);
      setHasWon(true);
    }, GameConfig.duration.gameOverScreenDelay);
  }, []);

  const showMessage = useCallback((
    msg: string,
    type: 'error' | 'success' | 'info' = 'error',
    persist = false
  ) => {
    setMessage(msg);
    setMessageType(type);
    setMessagePersist(persist);
  }, []);

  const handleMessageClose = useCallback(() => {
    if (
      message === GameConfig.messages.startingLettersMessage &&
      !gameStarted &&
      selectedLetters.length < GameConfig.startingLettersNumber
    ) return;
    setMessage('');
  }, [message, gameStarted, selectedLetters.length]);

  const checkLettersInClues = useCallback((letters: string): string[] => {
    const clueWords = [
      getWordFromClue(cluesData.clue_1)?.toUpperCase(),
      getWordFromClue(cluesData.clue_2)?.toUpperCase(),
      getWordFromClue(cluesData.clue_3)?.toUpperCase(),
    ].filter(Boolean) as string[];

    return letters.split('').filter(letter =>
      clueWords.some(word => word.includes(letter.toUpperCase()))
    );
  }, [cluesData]);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // Puzzle
    cluesData,
    clueWordsArray,
    numbersForClue,
    puzzleDate,
    puzzleLoading,
    hasLoadedFromStorage,

    // Game progress
    lives,
    isGameOver,
    setIsGameOver,
    hasWon,
    hasRevealedOnLoss,
    setHasRevealedOnLoss,
    hintsRevealComplete,
    setHintsRevealComplete,
    
    // Letters
    selectedLetters,
    setSelectedLetters,
    lettersInClues,
    setLettersInClues,
    hasLostLifeForNoStartingLetters,
    setHasLostLifeForNoStartingLetters,

    // Word state — arrays
    wordInputs,
    setWordInputs,
    verified,
    setVerified,
    completed,
    setCompleted,
    sequenceRevealed,
    setSequenceRevealed,
    silentRevealed,
    setSilentRevealed,
    submittedGuesses,
    setSubmittedGuesses,

    // UI
    gameStarted,
    setGameStarted,
    cursorPosition,
    setCursorPosition,
    solvedClues,
    setSolvedClues,
    hintsEnabled,
    setHintsEnabled,

    // Animation
    revealedStartingColors,
    setRevealedStartingColors,
    hasStartingLettersAnimationCompleted,
    setHasStartingLettersAnimationCompleted,

    // Message
    message,
    messageType,
    messagePersist,

    // Handlers
    handleLifeLost,
    handleWin,
    showMessage,
    handleMessageClose,
    checkLettersInClues,
  };
}