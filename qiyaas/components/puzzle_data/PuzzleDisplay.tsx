// components/puzzle_data/PuzzleDisplay.tsx

'use client';

import Link from "next/link";
import { GameConfig } from "@/lib/gameConfig";
import { usePuzzleData } from "@/components/game_assets/word_clues/ExtractAnswer";

// Helper function to calculate puzzle number from server-provided date string
function getPuzzleNumber(puzzleDate: string): number {
  const [ly, lm, ld] = GameConfig.puzzleStartDay.split('-').map(Number);
  const launchDate = new Date(ly, lm - 1, ld, 12, 0, 0);
  const [year, month, day] = puzzleDate.split('-').map(Number);
  const currentDate = new Date(year, month - 1, day, 12, 0, 0);

  const diffTime = currentDate.getTime() - launchDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1;
}

// Helper function to format date from a YYYY-MM-DD string
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

export default function PuzzleDisplay() {
  const { puzzle, loading } = usePuzzleData();

  const wordTypes = [
    puzzle.clue_1.type,
    puzzle.clue_2.type,
    puzzle.clue_3.type,
  ] as Array<keyof typeof GameConfig.wordColors_puzzle>;

  const puzzleNumber = !loading && puzzle.date ? getPuzzleNumber(puzzle.date) : null;
  const formattedDate = !loading && puzzle.date ? formatDate(puzzle.date) : '. . .';

  return (
    <div className="flex gap-4 items-center flex-col w-[300px]">

      <div className="text-center">
        <div className="font-semibold text-2xl flex items-center justify-center gap-1">
          <span>Puzzle #</span>
          {puzzleNumber !== null
            ? puzzleNumber.toString().padStart(3, '0').split('').map((digit, index) => {
                const colorClass = wordTypes[index]
                  ? (GameConfig.wordColors_puzzle[wordTypes[index]] ?? '')
                  : '';
                return (
                  <span key={index} className={colorClass}>
                    {digit}
                  </span>
                );
              })
            : <span>. . .</span>
          }
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