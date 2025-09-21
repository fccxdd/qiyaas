// components/DashPlaceholder.tsx

"use client"

import React from 'react';

interface DashPlaceholderProps {
  numberOfClues?: number;
}

const DashPlaceholder: React.FC<DashPlaceholderProps> = ({ 
  numberOfClues = 3
}) => {
  return (
    <div className="w-1/4 flex flex-col justify-center items-start pl-8">
      <div className="space-y-8">
        {[...Array(numberOfClues)].map((_, index) => (
          <div key={index} className="flex items-center">
            {/* Single dash placeholder for each clue */}
            <span className="text-black dark:text-white text-4xl font-indie-flower">
                _          
            </span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default DashPlaceholder;