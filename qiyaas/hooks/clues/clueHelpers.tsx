// hooks/clueHelpers.tsx

/**
 * Find the next empty position in a word starting from a given position
 */
export function findNextEmptyPosition(
  clue: string, 
  fromPosition: number, 
  wordInputs: Map<number, string>
): number | null {
  for (let i = fromPosition + 1; i < clue.length; i++) {
    if (!wordInputs.has(i)) {
      return i;
    }
  }
  return null;
}

/**
 * Find the previous empty position in a word starting from a given position
 */
export function findPreviousEmptyPosition(
  fromPosition: number,
  wordInputs: Map<number, string>
): number | null {
  for (let i = fromPosition - 1; i >= 0; i--) {
    if (!wordInputs.has(i)) {
      return i;
    }
  }
  return null;
}

/**
 * Check if a word is completely filled
 */
export function isWordComplete(
  clue: string,
  wordInputs: Map<number, string>
): boolean {
  return wordInputs.size === clue.length;
}

interface TutorialWords {
  clue_1: string;
  clue_2: string;
  clue_3: string;
  numbers_for_clue: number[];
}

/**
 * Get all clues (no filtering needed - all words should be shown)
 */
export function getMatchingClues(
  clues: TutorialWords,
  startingLetters: string
): string[] {
  const matchingClues: string[] = [];

  Object.entries(clues).forEach(([key, value]) => {
    if (key.startsWith('clue_') && typeof value === 'string') {
      matchingClues.push(value);
    }
  });

  return matchingClues;
}

/**
 * Initialize word inputs with starting letters at ANY position they match
 */
export function initializeWordInputs(
  clue: string,
  startingLetters: Set<string>
): Map<number, string> {
  const wordInputs = new Map<number, string>();
  const clueUpper = clue.toUpperCase();
  
  for (let i = 0; i < clueUpper.length; i++) {
    if (startingLetters.has(clueUpper[i])) {
      wordInputs.set(i, clueUpper[i]);
    }
  }
  
  return wordInputs;
}