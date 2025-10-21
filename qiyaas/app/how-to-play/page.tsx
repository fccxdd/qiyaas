// app/how-to-play/page.tsx

import TutorialWalkthrough from "@/components/game_mode/tutorial/TutorialWalkthrough";
import GameHeader from "@/components/layouts/GameHeader";
import ThemeToggle from "@/components/themes/ThemeToggle";
import Loading from "@/components/game_assets/game_walkthrough/loading";
import Link from "next/link";
import HomeIcon from '@mui/icons-material/Home';

export default function HowToPlayPage() {
  return (
    <div>
      <GameHeader
        leftContent={
          <Link
            className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 w-8 sm:h-11 sm:w-11"
            href="/"
            aria-label="Home"
          >
            <HomeIcon className="text-lg sm:text-xl" />
          </Link>
        }
        rightContent={<ThemeToggle/>}
      />
      <Loading />
      <TutorialWalkthrough/>
    </div>
  );
}