// components/game_assets/number_clues/useHintHighlighter.tsx

"use client";

import React, { useRef } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface HintHighlighterProps {
  hintText: string;
  ruleType: string;
  wordType: string;
  isSolved: boolean;
  hintNumber: string;
}

const HintHighlighter: React.FC<HintHighlighterProps> = ({
  hintText,
  ruleType,
  wordType,
  isSolved,
  hintNumber
}) => {
  
  const parseHint = (hint: string) => {
    const cleanHint = hint.replace('= ', '');
    const parts = cleanHint.split(',');
    return {
      alphabetPart: parts[0]?.trim() || '',
      numberPart: parts[1]?.trim() || ''
    };
  };

  const { alphabetPart, numberPart } = parseHint(hintText);

  const getBackgroundColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'NOUN':      return GameConfig.wordColors_bg.noun;
      case 'VERB':      return GameConfig.wordColors_bg.verb;
      case 'ADJECTIVE': return GameConfig.wordColors_bg.adjective;
      default:          return '';
    }
  };

  const renderHighlightedHint = () => {
    const bgColor = getBackgroundColor(wordType);
    const highlightClass = `${bgColor} ${GameConfig.hintMappingColors} px-2 py-1 rounded font-bold animate-pop-in`;

    if (!isSolved) {
      return <>= {alphabetPart} , {numberPart}</>;
    }

    switch (ruleType) {
      case 'alphabet_rule':
        return (
          <>
            = <span key={`${hintNumber}-alpha`} className={highlightClass}>{alphabetPart}</span> , {numberPart}
          </>
        );
      
      case 'number_rule':
        return (
          <>
            = {alphabetPart} , <span key={`${hintNumber}-num`} className={highlightClass}>{numberPart}</span>
          </>
        );
      
      case 'length_rule':
        return <>= {alphabetPart} , {numberPart}</>;
      
      default:
        return <>= {alphabetPart} , {numberPart}</>;
    }
  };

  return <>{renderHighlightedHint()}</>;
};

export default HintHighlighter;