// components/CluePlaceholder.tsx

"use client"

import React from 'react';

interface CluePlaceholderProps {
  numbers?: number[];
}

const CluePlaceholder: React.FC<CluePlaceholderProps> = ({ 
  numbers = [] // Fixed 3 numbers for all tutorial slides
}) => {
  return (
    <div className="w-1/4 flex flex-col justify-center items-end pr-8">
      <div className="space-y-8 text-right">
        {numbers.map((number, index) => (
          <div key={index} className="text-4xl font-bold text-black dark:text-white">
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CluePlaceholder;