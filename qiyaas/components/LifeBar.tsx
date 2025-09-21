// components/LifeBar.tsx

"use client"

import React from 'react';

interface LifeBarProps {
  totalLives?: number;
  currentLives?: number;
}

const LifeBar: React.FC<LifeBarProps> = ({ 
  totalLives = 5, 
  currentLives = 5 
}) => {
  return (
    <div className="flex justify-end space-x-2 p-6">
      {[...Array(totalLives)].map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full ${
            index < currentLives 
              ? 'bg-purple-500' 
              : 'bg-gray-600'
          }`}
          aria-label={`Life ${index + 1}${index < currentLives ? ' - remaining' : ' - lost'}`}
        />
      ))}
    </div>
  );
};

export default LifeBar;