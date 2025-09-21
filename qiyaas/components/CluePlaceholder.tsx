// components/CluePlaceholder.tsx

"use client"

import React from 'react';
import hintMap from '@/data/hint_map.json';

interface CluePlaceholderProps {
	numbers?: number[];
	showHints?: boolean;
}

const CluePlaceholder: React.FC<CluePlaceholderProps> = ({ 
	numbers = [], // Fixed 3 numbers for all tutorial slides
	showHints = false
}) => {
	return (
		<div className="w-1/4 flex flex-col justify-center items-end pr-20">
			<div className="space-y-8 text-right">
				
				{numbers.map((number, index) => (
					<div key={index} className="flex items-center justify-end space-x-3">
						<div key={index} className="text-4xl font-bold text-black dark:text-white">
						{number}
						</div>

						{/* Hint - only show if showHints is true */}
						{showHints && (
							<div className="text-lg text-purple-600 font-mono">
								{hintMap[number.toString() as keyof typeof hintMap] || ''}
							</div>
						)}
				</div>
				))}
			</div>
		</div>
	);
};

export default CluePlaceholder;