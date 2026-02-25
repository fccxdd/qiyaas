// hooks/game_wins/useWinCondition.tsx

import { useEffect } from 'react';

interface UseWinConditionProps {
	completed: boolean[];
	onWin: () => void;
	isGameOver: boolean;
}

export function useWinCondition({
	completed,
	onWin,
	isGameOver,
}: UseWinConditionProps) {
	useEffect(() => {
		if (isGameOver) return;
		if (completed.length > 0 && completed.every(c => c)) {
			onWin();
		}
	}, [completed, onWin, isGameOver]);
}