// components/game_assets/game_walkthrough/ProgressIndicator.tsx

import { getTotalSteps } from './GameWalkthrough';

interface ProgressIndicatorProps {
currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
	const totalSteps = getTotalSteps();

	return (
	<div className="flex space-x-2">
		{Array.from({ length: totalSteps }).map((_, index) => (
		<div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${ index===currentStep
			? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-300 dark:bg-gray-600' }`} />
		))}
	</div>
	);
	};

	export default ProgressIndicator;