// hooks/clues/useTutorialGameState.ts
//
// Standalone game state for tutorial modes.
// Mirrors UseGameState but without storage — tutorial state is ephemeral.

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GameConfig } from '@/lib/gameConfig';
import { getWordFromClue } from '@/hooks/clues/clueTypes';
import { DailyWordPuzzle } from '@/components/game_assets/word_clues/ExtractAnswer';

export type { DailyWordPuzzle };

interface UseTutorialGameStateProps {
  cluesData: DailyWordPuzzle;
}

export function useTutorialGameState({ cluesData }: UseTutorialGameStateProps) {

  // ── Core state ────────────────────────────────────────────────────────────

  const [lives, setLives]                     = useState(GameConfig.maxLives);
  const [selectedLetters, setSelectedLetters] = useState('');
  const [gameStarted, setGameStarted]         = useState(false);
  const [hasWon, setHasWon]                   = useState(false);
  const [isGameOver, setIsGameOver]           = useState(false);
  const [hintsEnabled, setHintsEnabled]       = useState(true);

  const [lettersInClues, setLettersInClues]   = useState<string[]>([]);
  const [hasLostLifeForNoStartingLetters, setHasLostLifeForNoStartingLetters] = useState(false);

  const [message, setMessage]               = useState('');
  const [messageType, setMessageType]       = useState<'error' | 'success' | 'info'>('info');
  const [messagePersist, setMessagePersist] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // ── Word state — parallel arrays ──────────────────────────────────────────

  const clueWords = [
    getWordFromClue(cluesData.clue_1),
    getWordFromClue(cluesData.clue_2),
    getWordFromClue(cluesData.clue_3),
  ].filter(Boolean) as string[];

  const [wordInputs, setWordInputs] = useState<(string | null)[][]>(
    clueWords.map(w => Array(w.length).fill(null))
  );
  const [verified, setVerified] = useState<boolean[][]>(
    clueWords.map(w => Array(w.length).fill(false))
  );  const [completed, setCompleted]             = useState<boolean[]>([false, false, false]);
  const [sequenceRevealed, setSequenceRevealed] = useState<(string | null)[][]>([[], [], []]);
  const [silentRevealed, setSilentRevealed]   = useState<boolean[]>([false, false, false]);
  const [submittedGuesses, setSubmittedGuesses] = useState<string[][]>([[], [], []]);

  // ── UI state ──────────────────────────────────────────────────────────────

  const [cursorPosition, setCursorPosition]   = useState<{ clueIndex: number; position: number } | null>(null);
  const [solvedClues, setSolvedClues]         = useState<boolean[]>([false, false, false]);

  // ── Animation state ───────────────────────────────────────────────────────

  const [revealedStartingColors, setRevealedStartingColors]                             = useState<number[]>([]);
  const [hasStartingLettersAnimationCompleted, setHasStartingLettersAnimationCompleted] = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────

  const numbersForClue = useMemo(() => {
    return cluesData.numbers_for_clue ?? [
      cluesData.clue_1.number,
      cluesData.clue_2.number,
      cluesData.clue_3.number,
    ];
  }, [cluesData]);

  const clueWordsArray = useMemo(() => {
    return [
      getWordFromClue(cluesData.clue_1),
      getWordFromClue(cluesData.clue_2),
      getWordFromClue(cluesData.clue_3),
    ].filter(Boolean) as string[];
  }, [cluesData]);

  // ── Lives → game over ─────────────────────────────────────────────────────

  useEffect(() => {
    if (lives === 0 && !isGameOver) {
      setTimeout(() => {
        setIsGameOver(true);
        setHasWon(false);
      }, GameConfig.duration.gameOverScreenDelay);
    }
  }, [lives, isGameOver]);

  // ── Starting message ──────────────────────────────────────────────────────

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || gameStarted) return;

    if (selectedLetters.length < GameConfig.startingLettersNumber) {
      setMessage(GameConfig.messages.startingLettersMessage);
      setMessageType('info');
      setMessagePersist(true);
    } else if (selectedLetters.length === GameConfig.startingLettersNumber) {
      setMessage(GameConfig.messages.confirmStartingLetters);
      setMessageType('info');
      setMessagePersist(true);
    }
  }, [hasMounted, gameStarted, selectedLetters.length]);

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
    persist = false,
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

    // Game progress
    lives,
    isGameOver,
    setIsGameOver,
    hasWon,

    // Letters
    selectedLetters,
    setSelectedLetters,
    lettersInClues,
    setLettersInClues,
    hasLostLifeForNoStartingLetters,
    setHasLostLifeForNoStartingLetters,

    // Word state
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