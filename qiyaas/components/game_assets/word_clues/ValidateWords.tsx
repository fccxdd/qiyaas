// components/game_assets/word_clues/ValidateWords.tsx

// Validate Users Words Against The Valid Word List for the Game

import words from '@/data/wordsList';
import {GameConfig} from '@/lib/gameConfig';

const wordSet = new Set(words);

export function validateWord(word: string) {
  if (!word || typeof word !== 'string') {
    return { isValid: false, message: GameConfig.messages.wordNotComplete };
  }
  
  const normalizedWord = word.trim().toUpperCase();
  
  if (normalizedWord.length === 0) {
    return { isValid: false, message: GameConfig.messages.wordNotComplete };
  }
  
  return wordSet.has(normalizedWord);
}