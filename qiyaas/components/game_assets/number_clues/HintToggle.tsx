// components/game_assets/number_clues/HintToggle.tsx

"use client";

import React from 'react';
import hintMap from '@/data/hint_map.json';
import { GameConfig } from '@/lib/gameConfig';
import PulseGlow from '@/hooks/hint_toggle/pulseGlow';
import { usePuzzleData } from '@/components/game_assets/word_clues/ExtractAnswer';
import HintHighlighter from '@/hooks/hint_toggle/useHintHighlighter';
import HintVisibilityManager from '@/hooks/hint_toggle/useHintVisibility';

interface HintToggleProps {
	hintsEnabled?: boolean;
	onToggle?: (enabled: boolean) => void;
	solvedClues?: boolean[];
	gameOver?: boolean;
}

const HintToggle: React.FC<HintToggleProps> = ({ 
	hintsEnabled = true, 
	onToggle,
	solvedClues = [false, false, false],
	gameOver
}) => { 
	// Get puzzle data from API
	const { puzzle, loading } = usePuzzleData();
	
	// Extract numbers and word types from puzzle
	const numbersForClue = puzzle.numbers_for_clue;
	const wordTypes = [
		puzzle.clue_1.type,
		puzzle.clue_2.type,
		puzzle.clue_3.type
	];
	
	// Extract rule types for highlighting
	const ruleTypes = [
		puzzle.clue_1.rule,
		puzzle.clue_2.rule,
		puzzle.clue_3.rule
	];

	// Get background color based on word type
	const getBackgroundColor = (type?: string) => {
		if (!type) return '';
		
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

	// Get color class based on word type
	const getWordTypeColor = (type?: string, isSolved?: boolean) => {
		if (!type) return `${GameConfig.wordColors.default}`;
		
		// Don't override color for solved clues - let them keep their word type color
		switch (type.toUpperCase()) {
			case 'NOUN':
				return GameConfig.wordColors.noun;
			case 'VERB':
				return GameConfig.wordColors.verb;
			case 'ADJECTIVE':
				return GameConfig.wordColors.adjective;
			default:
				return `${GameConfig.wordColors.default}`;
		}
	};

	// Get hover color based on word type
	const getHoverColor = (type?: string) => {
		if (!type) return 'hover:text-green-700 dark:hover:text-green-400';
		return 'hover:opacity-80';
	};

return (
	<HintVisibilityManager
		numbersForClue={numbersForClue}
		puzzleDate={puzzle.date}
		hintsEnabled={hintsEnabled}
	>
		{({ hintsVisible, hintsOpacity, toggleHint }) => (
			<div className="hint-container flex flex-col justify-center items-start relative">
				{numbersForClue.map((number, index) => {
					// Get the word type and rule type for this hint
					const wordType = wordTypes[index];
					const ruleType = ruleTypes[index];
					const isSolved = solvedClues[index];
					const colorClass = getWordTypeColor(wordType, isSolved);
					const hoverClass = getHoverColor(wordType);
					const hintText = hintMap[number.toString() as keyof typeof hintMap] || '';

					// Force hints visible when game is over
					const isHintVisible = gameOver || hintsVisible[index];
					const isHintOpaque = gameOver || hintsOpacity[index];

					return (
						<div key={index} className="flex items-center relative">
							
							{/* Number always visible - with PulseGlow only when hint is hidden */}
							<PulseGlow
								enabled={hintsEnabled && !isHintVisible && !gameOver}
								onInteraction={() => !gameOver && toggleHint(index)}
								className={`hint-number relative z-10 transition-all duration-500 ease-in-out rounded-lg ${
									// Add background highlight if it's a length_rule and solved (regardless of hint visibility)
									(ruleType === 'length_rule' && isSolved) 
										? `${getBackgroundColor(wordType)} ${GameConfig.hintMappingColors} px-2 py-1 rounded font-bold`
										: `${colorClass} font-bold`
								} ${
									(hintsEnabled || isSolved) && !gameOver
										? `${hoverClass} hover:scale-110 active:scale-95 cursor-pointer` 
										: gameOver 
											? 'cursor-default'
											: 'cursor-not-allowed'
								}`}
								style={{ fontFamily: 'Indie Flower' }}
							>
								{number}
							</PulseGlow>

							{/* Show hint text (without number) when visible */}
							{isHintVisible && (
								<div 
									onClick={() => !gameOver && toggleHint(index)}
									className={`hint-text rounded backdrop-blur-sm z-50 whitespace-nowrap transition-all duration-500 ease-in-out tracking-tighter sm:tracking-normal ${
										gameOver ? 'cursor-default' : 'cursor-pointer'
									} ${
										colorClass
									} ${
										isHintOpaque ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
									}`}
									style={{ fontFamily: 'Indie Flower', fontWeight: 'bold' }}
								>
									<HintHighlighter
										hintText={hintText}
										ruleType={ruleType}
										wordType={wordType}
										isSolved={isSolved}
										hintNumber={number.toString()}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		)}
	</HintVisibilityManager>
);
};

export default HintToggle;