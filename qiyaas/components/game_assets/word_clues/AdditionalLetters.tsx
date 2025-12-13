// components/game_assets/word_clues/AdditionalLetters.tsx

'use client';

import LetterSelectorGroup, { LetterSelectorConfig } from './LetterSelectorGroup';
import { GameConfig } from '@/lib/gameConfig';
import { LetterType } from './LetterSelector';

interface AdditionalLettersProps {
	onRequestAdditionalLetter?: (type: 'vowel' | 'consonant') => void;
	additionalLetters?: { vowel?: string; consonant?: string; };
	gameStarted?: boolean;
	awaitingLetterType?: 'vowel' | 'consonant' | null;
	pendingLetter?: { vowel?: string; consonant?: string; };
	lettersInClues?: Set<string>;
	validatedLetters?: {
		vowel?: { letter: string; correct: boolean };
		consonant?: { letter: string; correct: boolean };
	};
	onCancelSelection?: () => void;
}

export default function AdditionalLetters({
	onRequestAdditionalLetter,
	additionalLetters,
	gameStarted = false,
	awaitingLetterType = null,
	pendingLetter = {},
	validatedLetters = {},
	onCancelSelection,
}: AdditionalLettersProps) {
	
	// Configure the letter selectors
	const selectors: LetterSelectorConfig[] = [
		{
			type: 'vowel' as LetterType,
			label: '+V',
			colorConfig: {
				label: GameConfig.additionalColors.vowel,
				selected: GameConfig.additionalColors.selectedLetter,
				unselected: GameConfig.additionalColors.unselectedLetter,
			}
		},
		{
			type: 'consonant' as LetterType,
			label: '+C',
			colorConfig: {
				label: GameConfig.additionalColors.consonant,
				selected: GameConfig.additionalColors.selectedLetter,
				unselected: GameConfig.additionalColors.unselectedLetter,
			}
		}
	];

	// Convert the props to the format expected by LetterSelectorGroup
	const letters: { [key: string]: string } = {};
	if (additionalLetters?.vowel) letters.vowel = additionalLetters.vowel;
	if (additionalLetters?.consonant) letters.consonant = additionalLetters.consonant;

	const pending: { [key: string]: string } = {};
	if (pendingLetter?.vowel) pending.vowel = pendingLetter.vowel;
	if (pendingLetter?.consonant) pending.consonant = pendingLetter.consonant;

	const validated: { [key: string]: { letter: string; correct: boolean } } = {};
	if (validatedLetters?.vowel) validated.vowel = validatedLetters.vowel;
	if (validatedLetters?.consonant) validated.consonant = validatedLetters.consonant;

	const handleRequestLetter = (type: LetterType) => {
		if (type === 'vowel' || type === 'consonant') {
			onRequestAdditionalLetter?.(type);
		}
	};

	return (
		<LetterSelectorGroup
			selectors={selectors}
			onRequestLetter={handleRequestLetter}
			letters={letters}
			gameStarted={gameStarted}
			awaitingLetterType={awaitingLetterType}
			pendingLetters={pending}
			validatedLetters={validated}
			onCancelSelection={onCancelSelection}
		/>
	);
}