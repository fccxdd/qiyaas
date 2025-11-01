"use client";

import DailyWordsData from '@/data/daily_words.json';

// ----------------------
// Types
// ----------------------
export type DailyWordRound = {
  clue_1: string;
  clue_2: string;
  clue_3: string;
  numbers_for_clue: number[];
};

export type DailyWordsByRound = {
  [roundKey: string]: DailyWordRound;
};

export type DailyWordsByDate = {
  [dateKey: string]: DailyWordsByRound;
};

// ----------------------
// Config: today's date
// ----------------------
const todayKey = new Date().toISOString().slice(0, 10);
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
      clue_1: '',
      clue_2: '',
      clue_3: '',
      numbers_for_clue: [0, 0, 0],
    };
  }

  return roundsArray[currentRoundIndex] ?? roundsArray[0];
}

/**
 * Returns an array of correct answers in lowercase
 */
export function getClueAnswers(): { clueAnswers: string[] } {
  const round = getCurrentRound();
  return {
    clueAnswers: [
      round.clue_1.toLowerCase(),
      round.clue_2.toLowerCase(),
      round.clue_3.toLowerCase()
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
  return { numbersForClue: round.numbers_for_clue ?? [0, 0, 0] };
}

/**
 * Returns a single clue answer by index (0,1,2)
 */
export function getClueAnswer(index: number): { clueAnswer: string | null } {
  const round = getCurrentRound();
  if (index === 0) return { clueAnswer: round.clue_1.toLowerCase() };
  if (index === 1) return { clueAnswer: round.clue_2.toLowerCase() };
  if (index === 2) return { clueAnswer: round.clue_3.toLowerCase() };
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
