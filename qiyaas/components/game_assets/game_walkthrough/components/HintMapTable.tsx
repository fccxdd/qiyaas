// components/game_assets/game_walkthrough/components/HintMapTable.tsx

'use client';

import hintMap from '@/data/hint_map.json';

export default function HintMapTable() {
  // Parse the hint map to extract alphabet and number rules
  const parseHintMap = () => {
    // Convert number to full word with letter prefix
    const getNumberWord = (num: number, letter: string): string => {
      const words = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
      return `${letter} = ${words[num]}`;
    };
    
    return Object.entries(hintMap).map(([number, rule]) => {
      // Remove the "=" and split by comma
      const [alphabetLetter, numberLetter] = rule.replace('=', '').split(',').map(s => s.trim());
      
      const numValue = parseInt(number);
      return {
        number: numValue,
        alphabetLetter,
        numberLetter: getNumberWord(numValue, numberLetter), // Format as "O = ONE"
        lengthRule: numValue >= 3 ? `${numValue} LETTER WORD` : '.'
      };
    });
  };

  const tableData = parseHintMap();

  return (
    <div className="w-full overflow-x-auto py-4">
      <table className="w-full border-collapse text-sm sm:text-base md:text-lg">
        <thead>
          <tr className="border-b-1 ">
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-black dark:text-white">
              NUMBER
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-black dark:text-white">
              ALPHABET RULE
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-black dark:text-white">
              NUMBER RULE
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-black dark:text-white">
              LENGTH RULE
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => {
            // Cycle through the three colors for text
            const colors = ['#74A8DC', '#6AA84F', '#E06666'];
            const textColor = colors[index % 3];
            
            return (
              <tr 
                key={row.number}
                className=""
              >
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold" style={{ color: textColor }}>
                {row.number}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center" style={{ color: textColor }}>
                {row.alphabetLetter}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center" style={{ color: textColor }}>
                {row.numberLetter}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center" style={{ color: textColor }}>
                {row.lengthRule}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}