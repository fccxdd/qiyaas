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
  // 'number' | 'alpha' | 'value' | null — dims the other parts
  spotlightColumn?: 'number' | 'alpha' | 'value' | null;
}

const HintHighlighter: React.FC<HintHighlighterProps> = ({
  hintText,
  ruleType,
  wordType,
  isSolved,
  hintNumber,
  spotlightColumn = null,
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

  // When a spotlightColumn is active, dim parts that aren't spotlit
  const dim = (col: 'alpha' | 'value') =>
    spotlightColumn && spotlightColumn !== col
      ? 'opacity-20'
      : '';

  // Dim separators whenever any column is spotlit
  const sepClass = spotlightColumn ? 'opacity-20 transition-opacity duration-300' : '';

  const renderHighlightedHint = () => {
    const bgColor = getBackgroundColor(wordType);
    const highlightClass = `${bgColor} ${GameConfig.hintMappingColors} px-2 py-1 rounded font-bold animate-pop-in`;

    if (!isSolved) {
      return (
        <>
          <span className={sepClass}>=</span>{' '}
          <span className={`transition-opacity duration-300 ${dim('alpha')}`}>{alphabetPart}</span>
          {' '}<span className={sepClass}>,</span>{' '}
          <span className={`transition-opacity duration-300 ${dim('value')}`}>{numberPart}</span>
        </>
      );
    }

    switch (ruleType) {
      case 'alphabet_rule':
        return (
          <>
            <span className={sepClass}>=</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('alpha')}`}>
              <span key={`${hintNumber}-alpha`} className={highlightClass}>{alphabetPart}</span>
            </span>
            {' '}<span className={sepClass}>,</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('value')}`}>{numberPart}</span>
          </>
        );

      case 'number_rule':
        return (
          <>
            <span className={sepClass}>=</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('alpha')}`}>{alphabetPart}</span>
            {' '}<span className={sepClass}>,</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('value')}`}>
              <span key={`${hintNumber}-num`} className={highlightClass}>{numberPart}</span>
            </span>
          </>
        );

      case 'length_rule':
        return (
          <>
            <span className={sepClass}>=</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('alpha')}`}>{alphabetPart}</span>
            {' '}<span className={sepClass}>,</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('value')}`}>{numberPart}</span>
          </>
        );

      default:
        return (
          <>
            <span className={sepClass}>=</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('alpha')}`}>{alphabetPart}</span>
            {' '}<span className={sepClass}>,</span>{' '}
            <span className={`transition-opacity duration-300 ${dim('value')}`}>{numberPart}</span>
          </>
        );
    }
  };

  return <>{renderHighlightedHint()}</>;
};

export default HintHighlighter;