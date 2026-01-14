// components/puzzle_data/PuzzleDisplay.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { GameConfig } from "@/lib/gameConfig";

interface PuzzleClue {
  type: 'NOUN' | 'VERB' | 'ADJECTIVE';
  word: string;
  rule: string;
  number: number;
  length_category: string;
  word_length: number;
}

interface PuzzleData {
  date: string;
  clues: PuzzleClue[];
}

interface PuzzleDisplayProps {
  initialData: PuzzleData;
}

// Helper function to calculate puzzle number
function getPuzzleNumber(puzzleDate: string): number {
  const launchDate = new Date(GameConfig.puzzleStartDay);
  const currentDate = new Date(puzzleDate);
  
  const diffTime = currentDate.getTime() - launchDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

export default function PuzzleDisplay({ initialData }: PuzzleDisplayProps) {
  const [puzzleData, setPuzzleData] = useState<PuzzleData>(initialData);
  
  useEffect(() => {
    async function fetchPuzzle() {
      try {
        const response = await fetch(`${GameConfig.urlName}/puzzle`);
        const data = await response.json();
        setPuzzleData(data);
      } catch (error) {
        console.error('Error fetching puzzle:', error);
      }
    }
    
    // Calculate time until midnight EST
    const now = new Date();
    
    // Get current time in EST
    const nowEST = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // Create midnight EST for tomorrow
    const tomorrowEST = new Date(nowEST);
    tomorrowEST.setHours(24, 0, 0, 0);
    
    // Calculate milliseconds until midnight EST
    const msUntilMidnight = tomorrowEST.getTime() - nowEST.getTime();
    
    const midnightTimer = setTimeout(() => {
      fetchPuzzle(); // Refresh at midnight EST
      // Set up daily interval
      setInterval(fetchPuzzle, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);
  
  const puzzleNumber = getPuzzleNumber(puzzleData.date);
  const formattedDate = formatDate(puzzleData.date);
  const wordTypes = puzzleData.clues?.map((clue) => clue.type) || [];
  
  return (
    <div className="flex gap-4 items-center flex-col w-[300px]">
      
      <div className="text-center">
        <div className="font-semibold text-2xl flex items-center justify-center gap-1">
          <span>Puzzle #</span>
          {puzzleNumber.toString().padStart(3, '0').split('').map((digit, index) => {
            const colorClass = wordTypes[index] ? GameConfig.wordColors_puzzle[wordTypes[index] as keyof typeof GameConfig.wordColors_puzzle] : '';
            return (
              <span key={index} className={colorClass}>
                {digit}
              </span>
            );
          })}
        </div>
        <div className="text-2xl text-gray-600 dark:text-gray-400">{formattedDate}</div>
      </div>
      
      <Link
        className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 sm:h-11 px-5 sm:px-4 w-[140px] whitespace-nowrap"
        href="/how-to-play"
      >
        How To Play
      </Link>

      <Link
        className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 sm:h-11 px-5 sm:px-4 w-[140px] whitespace-nowrap"
        href="/play"
      >
        Play
      </Link>
    </div>
  );
}