// components/game_assets/word_clues/ExtractAnswer.tsx

// Extract the Correct Answer

"use client"

import tutorialWords from '@/data/tutorial_words.json';

// Description of TutorialWords File
type TutorialWords = {
                        clue_1: string;
                        clue_2: string;
                        clue_3: string;
                        numbers_for_clue: number[];
                    };

/**
 * Extracts the correct answers for all clues in uppercase
 * @returns {clueAnswers: string[]} - Array of correct answers in uppercase
 */
export function getClueAnswers(): { clueAnswers: string[] } 
    {
        const words = tutorialWords as TutorialWords;
        return {
            clueAnswers: [
            words.clue_1.toLowerCase(),
            words.clue_2.toLowerCase(),
            words.clue_3.toLowerCase()
            ]
        };
    }

/**
 * Gets the numbers for the clues
 * @returns {numbersForClue: number[]} - Array of numbers corresponding to each clue
 */
export function getNumbersForClue(): { numbersForClue: number[] } 
    {
        const words = tutorialWords as TutorialWords;
        return {
            numbersForClue: words.numbers_for_clue
        };
    }

/**
 * Gets a specific clue answer by index (0-based)
 * @param {number} index - The index of the clue (0, 1, or 2)
 * @returns {clueAnswer: string | null} - The correct answer in uppercase
 */
export function getClueAnswer(index: number): { clueAnswer: string | null } 
    
    {
        const words = tutorialWords as TutorialWords;
        
        if (index === 0) return { clueAnswer: words.clue_1.toLowerCase() };
        if (index === 1) return { clueAnswer: words.clue_2.toLowerCase() };
        if (index === 2) return { clueAnswer: words.clue_3.toLowerCase() };
        
        return { clueAnswer: null };
    }