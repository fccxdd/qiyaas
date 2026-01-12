// hooks/clues/clueTypes.tsx

/**
 * Shared type definitions for clues across Tutorial and GamePlay modes
 */

// Base clue value - can be either a string (Tutorial) or an object (GamePlay)
export type ClueValue = { word: string; type: string }; // string |  TODO: Change Tutorial Mode to be object as well

// Base clues data structure used by both modes
export interface BaseCluesData {
  clue_1: ClueValue;
  clue_2: ClueValue;
  clue_3: ClueValue;
  numbers_for_clue: number[];
}

// Tutorial mode
export interface TutorialCluesData {
  clue_1: ClueWithType;
  clue_2: ClueWithType;
  clue_3: ClueWithType;
  numbers_for_clue: number[];
}

// Clue include word type information
export interface ClueWithType {
  word: string;
  type: string; // "NOUN" | "VERB" | "ADJECTIVE"
}

export interface GamePlayCluesData {
  clue_1: ClueWithType;
  clue_2: ClueWithType;
  clue_3: ClueWithType;
  numbers_for_clue: number[];
}

// Normalized clues data - always has word strings
export interface NormalizedCluesData {
  clue_1: string;
  clue_2: string;
  clue_3: string;
  numbers_for_clue: number[];
}

/**
 * Type guard to check if a clue is a GamePlay clue (has word/type structure)
 */
export function isGamePlayClue(clue: ClueValue): clue is ClueWithType {
  return typeof clue === 'object' && 'word' in clue && 'type' in clue;
}

/**
 * Type guard to check if clues data is GamePlay format
 */
export function isGamePlayCluesData(clues: BaseCluesData): clues is GamePlayCluesData {
  return isGamePlayClue(clues.clue_1);
}

/**
 * Extract the word string from a clue value
 */
export function getWordFromClue(clue?: ClueValue | null): string | null {
  if (!clue) return null;
  if (typeof clue === 'string') {
    return clue;
  }
  return clue.word;
}

/**
 * Extract the type from a clue value
 */
export function getTypeFromClue(clue?: ClueValue | null): string | null {
  if (!clue) return null;
  if (typeof clue === 'string') return null;
  return clue.type ?? null;
}

/**
 * Normalize clues data to always return word strings
 * Useful for components that only need the words, not the types
 */
export function normalizeCluesData(clues: BaseCluesData): NormalizedCluesData {
  return {
    clue_1: getWordFromClue(clues.clue_1) ?? '',
    clue_2: getWordFromClue(clues.clue_2) ?? '',
    clue_3: getWordFromClue(clues.clue_3) ?? '',
    numbers_for_clue: clues.numbers_for_clue
  };
}
/**
 * Get all clue words as an array
 */
export function getClueWordsArray(clues: BaseCluesData): string[] {
  return [
    getWordFromClue(clues.clue_1),
    getWordFromClue(clues.clue_2),
    getWordFromClue(clues.clue_3)
  ].filter((word): word is string => word !== null);
}

/**
 * Get all clue types as an array
 */
export function getClueTypesArray(clues: BaseCluesData): string[] {
  return [
    getTypeFromClue(clues.clue_1),
    getTypeFromClue(clues.clue_2),
    getTypeFromClue(clues.clue_3)
  ].filter((type): type is string => type !== null);
}

/**
 * Get a specific clue by index (0, 1, or 2)
 */
export function getClueByIndex(clues: BaseCluesData, index: number): ClueValue | null {
  switch (index) {
    case 0:
      return clues.clue_1;
    case 1:
      return clues.clue_2;
    case 2:
      return clues.clue_3;
    default:
      return null;
  }
}

/**
 * Get a specific clue word by index (0, 1, or 2)
 */
export function getClueWordByIndex(clues: BaseCluesData, index: number): string | null {
  const clue = getClueByIndex(clues, index);
  return clue ? getWordFromClue(clue) : null;
}

/**
 * Get a specific clue type by index (0, 1, or 2)
 */
export function getClueTypeByIndex(clues: BaseCluesData, index: number): string | undefined | null {
  const clue = getClueByIndex(clues, index);
  return clue ? getTypeFromClue(clue) : null;
}