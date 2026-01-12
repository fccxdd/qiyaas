// hooks/clues/clueHelpers.tsx

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