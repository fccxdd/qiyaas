// components/game_assets/number_clues/useHintHighlighter.tsx

"use client";

import React from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface HintHighlighterProps {
  hintText: string;
  ruleType: string;
  wordType: string;
  isSolved: boolean;
  hintNumber: string;
}

/**
 * Component that highlights the relevant part of a hint based on the clue's rule type
 * 
 * Hint format: "= X,Y" where:
 * - X is the alphabet_rule part
 * - Y is the number_rule part
 * - The number before "=" is handled separately in parent for length_rule
 * 
 * @param hintText - The full hint text (e.g., "= A , O")
 * @param ruleType - The type of rule: "alphabet_rule", "number_rule", or "length_rule"
 * @param wordType - The word type: "noun", "verb", or "adjective"
 * @param isSolved - Whether the clue is solved (affects styling)
 * @param hintNumber - The hint number (not used in rendering, just for reference)
 */
const HintHighlighter: React.FC<HintHighlighterProps> = ({
  hintText,
  ruleType,
  wordType,
  isSolved,
  hintNumber
}) => {
  
  // Parse the hint text to extract parts
  // Format: "= A , O" or "= B , T"
  const parseHint = (hint: string) => {
    // Remove "= " prefix and split by comma
    const cleanHint = hint.replace('= ', '');
    const parts = cleanHint.split(',');
    
    return {
      alphabetPart: parts[0]?.trim() || '',
      numberPart: parts[1]?.trim() || ''
    };
  };

  const { alphabetPart, numberPart } = parseHint(hintText);

  // Get background color based on word type
  const getBackgroundColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'NOUN':
        return GameConfig.wordColors_bg.noun;
      case 'VERB':
        return GameConfig.wordColors_bg.verb;
      case 'ADJECTIVE':
        return GameConfig.wordColors_bg.adjective;
      default:
        return '';
    }
  };

// Determine which part to highlight based on rule type
const renderHighlightedHint = () => {
  const bgColor = getBackgroundColor(wordType);
  const highlightClass = `${bgColor} ${GameConfig.hintMappingColors} px-2 py-1 rounded font-bold`;

  // Only highlight if the clue is solved - otherwise show plain text
  if (!isSolved) {
    return <>= {alphabetPart} , {numberPart}</>;
  }

  switch (ruleType) {
    case 'alphabet_rule':
      return (
        <>
          = <span className={highlightClass}>{alphabetPart}</span> , {numberPart}
        </>
      );
    
    case 'number_rule':
      return (
        <>
          = {alphabetPart} , <span className={highlightClass}>{numberPart}</span>
        </>
      );
    
    case 'length_rule':
      // For length_rule, the number in the parent is already being highlighted
      // Just show the hint text part
      return <>= {alphabetPart} , {numberPart}</>;
    
    default:
      return <>= {alphabetPart} , {numberPart}</>;
  }
};

  return <>{renderHighlightedHint()}</>;
};

export default HintHighlighter;