// components/game_assets/word_clues/ExtractAnswer.tsx

"use client";

import { GameConfig } from '@/lib/gameConfig';
import { useState, useEffect } from 'react';

// ----------------------
// Types
// ----------------------
export type ClueWithType = {
  word: string;
  type: string;
  rule: string;
  number: number;
  length_category: string;
  word_length: number;
};

export type DailyWordPuzzle = {
  date: string;
  clue_1: ClueWithType;
  clue_2: ClueWithType;
  clue_3: ClueWithType;
  numbers_for_clue: number[];
};

// ----------------------
// API Configuration
// ----------------------
const API_ENDPOINT = process.env.NEXT_PUBLIC_PUZZLE_API_URL || 'https://beta.qiyaasgame.com/puzzle';

// ----------------------
// Helper to get today's date in America/New_York timezone
// ----------------------
const getTodayKey = () => {
  const now = new Date();
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

// ----------------------
// Fallback puzzle data
// ----------------------
const getFallbackPuzzle = (): DailyWordPuzzle => ({
  date: getTodayKey(),
  clue_1: { word: '', type: '', rule: '', number: 0, length_category: '', word_length: 0 },
  clue_2: { word: '', type: '', rule: '', number: 0, length_category: '', word_length: 0 },
  clue_3: { word: '', type: '', rule: '', number: 0, length_category: '', word_length: 0 },
  numbers_for_clue: GameConfig.hintNumberFallback,
});

// ----------------------
// Fetch puzzle from API
// ----------------------
let cachedPuzzle: DailyWordPuzzle | null = null;
let fetchPromise: Promise<DailyWordPuzzle> | null = null;

const fetchPuzzleFromAPI = async (): Promise<DailyWordPuzzle> => {
  // Return cached puzzle if available and from today
  if (cachedPuzzle && cachedPuzzle.date === getTodayKey()) {
    return cachedPuzzle;
  }

  // If already fetching, return the existing promise
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start new fetch
  fetchPromise = (async () => {
    try {
      const response = await fetch(API_ENDPOINT, {
        cache: 'no-store', // Always get fresh data
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Validate data structure
      if (!data.clues || data.clues.length !== 3) {
        console.error('Invalid puzzle data from API');
        return getFallbackPuzzle();
      }

      // Parse into expected format
      const puzzle: DailyWordPuzzle = {
        date: data.date,
        clue_1: data.clues[0],
        clue_2: data.clues[1],
        clue_3: data.clues[2],
        numbers_for_clue: [
          data.clues[0].number,
          data.clues[1].number,
          data.clues[2].number
        ],
      };

      // Cache the result
      cachedPuzzle = puzzle;
      fetchPromise = null;

      return puzzle;
    } catch (error) {
      console.error('Error fetching puzzle from API:', error);
      fetchPromise = null;
      return getFallbackPuzzle();
    }
  })();

  return fetchPromise;
};

// ----------------------
// Initialize puzzle on load
// ----------------------
let currentPuzzle: DailyWordPuzzle = getFallbackPuzzle();

// Fetch puzzle immediately
fetchPuzzleFromAPI().then(puzzle => {
  currentPuzzle = puzzle;
});

// ----------------------
// Public API
// ----------------------

/**
 * Returns the current puzzle's date
 */
export function getPuzzleDate(): string {
  return currentPuzzle.date;
}

/**
 * Returns the current day's puzzle data
 */
export function getCurrentRound(): DailyWordPuzzle {
  return currentPuzzle;
}

/**
 * Returns an array of correct answers in lowercase
 */
export function getClueAnswers(): { clueAnswers: string[] } {
  return {
    clueAnswers: [
      currentPuzzle.clue_1.word.toLowerCase(),
      currentPuzzle.clue_2.word.toLowerCase(),
      currentPuzzle.clue_3.word.toLowerCase()
    ]
  };
}

/**
 * Returns the full current puzzle data
 */
export function getCluesData(): DailyWordPuzzle {
  return currentPuzzle;
}

/**
 * Returns the numbers associated with each clue
 */
export function getNumbersForClue(): { numbersForClue: number[] } {
  return { numbersForClue: currentPuzzle.numbers_for_clue };
}

/**
 * Returns a single clue answer by index (0, 1, 2)
 */
export function getClueAnswer(index: number): { clueAnswer: string | null } {
  if (index === 0) return { clueAnswer: currentPuzzle.clue_1.word.toLowerCase() };
  if (index === 1) return { clueAnswer: currentPuzzle.clue_2.word.toLowerCase() };
  if (index === 2) return { clueAnswer: currentPuzzle.clue_3.word.toLowerCase() };
  return { clueAnswer: null };
}

/**
 * Hook to use puzzle data in React components
 */
export function usePuzzleData() {
  const [puzzle, setPuzzle] = useState<DailyWordPuzzle>(currentPuzzle);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPuzzleFromAPI().then(data => {
      setPuzzle(data);
      currentPuzzle = data;
      setLoading(false);
    });
  }, []);

  return { puzzle, loading };
}