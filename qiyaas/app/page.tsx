import Link from "next/link";
import ThemeToggle from "@/components/themes/ThemeToggle";
import EmailButton from "@/components/contact/EmailButton";
import QiyaasLogo from "@/components/ux/QiyaasLogo";
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

// Helper function to calculate puzzle number
function getPuzzleNumber(puzzleDate: string): number {
  // Set your game's launch date (first puzzle date)
  const launchDate = new Date(GameConfig.puzzleStartDay); // Change this to your actual launch date
  const currentDate = new Date(puzzleDate);
  
  // Calculate days difference
  const diffTime = currentDate.getTime() - launchDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Puzzle number is days since launch + 1
  return diffDays + 1;
}

// Helper function to format date
function formatDate(dateString: string): string {
  // Parse the date string (YYYY-MM-DD) without timezone conversion
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // Create date in local timezone
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

export const revalidate = 86400; // 24 hours

async function getPuzzleData(): Promise<PuzzleData> {
  try {
    // Replace with your actual Cloudflare Worker URL
    const response = await fetch(`${GameConfig.urlName}/puzzle`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch puzzle data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching puzzle:', error);
    // Return fallback data
    return {
      date: new Date().toISOString().split('T')[0],
	  clues: []
    };
  }
}

export default async function Home() {
  const puzzleData = await getPuzzleData();
  const puzzleNumber = getPuzzleNumber(puzzleData.date);
  const formattedDate = formatDate(puzzleData.date);
  
  // Get the word types for coloring
  const wordTypes = puzzleData.clues?.map((clue) => clue.type) || [];
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 relative">
      
      <header className="row-start-1 self-start w-full flex justify-end">
        <ThemeToggle />
      </header>
      
      <main className="flex flex-col gap-8 sm:gap-10 row-start-2 items-center">
        
		<QiyaasLogo className="w-[200px] h-[100px] sm:w-[400px] sm:h-[193px]"/>
        
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
      </main>
      
      <EmailButton/>
    </div>
  );
}