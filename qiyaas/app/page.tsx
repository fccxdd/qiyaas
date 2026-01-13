import Link from "next/link";
import ThemeToggle from "@/components/themes/ThemeToggle";
import EmailButton from "@/components/contact/EmailButton";
import QiyaasLogo from "@/components/ux/QiyaasLogo";
import { GameConfig } from "@/lib/gameConfig";
import PuzzleDisplay from "@/components/puzzle_data/PuzzleDisplay";

export const dynamic = 'force-dynamic';

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

async function getPuzzleData(): Promise<PuzzleData> {
  try {
    const response = await fetch(`${GameConfig.urlName}/puzzle`, {
      cache: 'no-store' // Always fetch fresh on server
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch puzzle data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return {
      date: new Date().toISOString().split('T')[0],
      clues: []
    };
  }
}

export default async function Home() {
  const initialPuzzleData = await getPuzzleData();
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 relative">
      
      <header className="row-start-1 self-start w-full flex justify-end">
        <ThemeToggle />
      </header>
      
      <main className="flex flex-col gap-8 sm:gap-10 row-start-2 items-center">
        
        <QiyaasLogo className="w-[200px] h-[100px] sm:w-[400px] sm:h-[193px]"/>
        
        <PuzzleDisplay initialData={initialPuzzleData} />
        
      </main>
      
      <EmailButton/>
    </div>
  );
}