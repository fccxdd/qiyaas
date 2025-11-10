"use client";

import DailyWordsData from '@/data/daily_words.json';
import { GameConfig}  from '@/lib/gameConfig';

// ----------------------
// Types
// ----------------------
export type ClueWithType = {
  word: string;
  type: string;
};

export type DailyWordRound = {
  clue_1: ClueWithType;
  clue_2: ClueWithType;
  clue_3: ClueWithType;
  numbers_for_clue: number[];
};

export type DailyWordsByRound = {
  [roundKey: string]: DailyWordRound;
};

export type DailyWordsByDate = {
  [dateKey: string]: DailyWordsByRound;
};

// ----------------------
// Config: today's date in America/New_York timezone
// ----------------------
const getTodayKey = () => {
  const now = new Date();
  // Convert to America/New_York timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
};

const todayKey = getTodayKey();
const dailyRounds = (DailyWordsData as DailyWordsByDate)[todayKey] ?? {};
const roundsArray = Object.values(dailyRounds) as DailyWordRound[];

// ----------------------
// Track current round
// ----------------------
let currentRoundIndex = 0;

// ----------------------
// Public API
// ----------------------

/**
 * Returns the current round's data with fallback
 */
export function getCurrentRound(): DailyWordRound {
  // Fallback if roundsArray is empty or index out of bounds
  if (!roundsArray || roundsArray.length === 0) {
    return {
      clue_1: { word: '', type: '' },
      clue_2: { word: '', type: '' },
      clue_3: { word: '', type: '' },
      numbers_for_clue: GameConfig.hintNumberFallback,
    };
  }

  return roundsArray[currentRoundIndex] ?? roundsArray[0];
}

/**
 * Get round by specific index (used for restoring from localStorage)
 */
export function getRoundByIndex(index: number): DailyWordRound {
  if (!roundsArray || roundsArray.length === 0) {
    return {
      clue_1: { word: '', type: '' },
      clue_2: { word: '', type: '' },
      clue_3: { word: '', type: '' },
      numbers_for_clue: GameConfig.hintNumberFallback,
    };
  }

  // Ensure index is within bounds
  const safeIndex = Math.max(0, Math.min(index, roundsArray.length - 1));
  return roundsArray[safeIndex] ?? roundsArray[0];
}

/**
 * Set the current round index (used when restoring from localStorage)
 */
export function setCurrentRoundIndex(index: number): void {
  if (index >= 0 && index < roundsArray.length) {
    currentRoundIndex = index;
  }
}

/**
 * Get the current round index
 */
export function getCurrentRoundIndex(): number {
  return currentRoundIndex;
}

/**
 * Returns an array of correct answers in lowercase
 */
export function getClueAnswers(): { clueAnswers: string[] } {
  const round = getCurrentRound();
  return {
    clueAnswers: [
      round.clue_1.word.toLowerCase(),
      round.clue_2.word.toLowerCase(),
      round.clue_3.word.toLowerCase()
    ]
  };
}

/**
 * Returns the full current round data
 */
export function getCluesData(): DailyWordRound {
  return getCurrentRound();
}

/**
 * Returns the numbers associated with each clue with fallback
 */
export function getNumbersForClue(): { numbersForClue: number[] } {
  const round = getCurrentRound();
  return { numbersForClue: round.numbers_for_clue ?? GameConfig.hintNumberFallback };
}

/**
 * Returns a single clue answer by index (0, 1, 2)
 */
export function getClueAnswer(index: number): { clueAnswer: string | null } {
  const round = getCurrentRound();
  if (index === 0) return { clueAnswer: round.clue_1.word.toLowerCase() };
  if (index === 1) return { clueAnswer: round.clue_2.word.toLowerCase() };
  if (index === 2) return { clueAnswer: round.clue_3.word.toLowerCase() };
  return { clueAnswer: null };
}

// ----------------------
// Advance to next round
// ----------------------
/**
 * Moves to the next round and returns its data
 */
export function advanceToNextRound(): DailyWordRound {
  currentRoundIndex++;
  if (currentRoundIndex >= roundsArray.length) {
    currentRoundIndex = 0; // loop back to the first round
  }
  return getCurrentRound();
}

/**
 * Reset to first round (useful for new game sessions)
 */
export function resetToFirstRound(): DailyWordRound {
  currentRoundIndex = 0;
  return getCurrentRound();
}