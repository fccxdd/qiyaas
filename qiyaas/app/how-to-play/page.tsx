// app/how-to-play/layout.tsx

import TutorialSlideshow from "@/components/game_mode/tutorial/TutorialModeSlideshow";
import ThemeToggle from "@/components/themes/ThemeToggle";
import Loading from "@/components/game_assets/game_walkthrough/loading";
import Link from "next/link";
import HomeIcon from '@mui/icons-material/Home';

export default function HowToPlay() {
  return (
    <div>
      <header className="absolute top-8 left-8 right-8 sm:top-20 sm:left-20 sm:right-20 z-50 flex items-center justify-between">
        <Link
          className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-10 w-10 sm:h-11 sm:w-11"
          href="/"
          aria-label="Home"
        >
          <HomeIcon className="text-lg sm:text-xl" />
        </Link>
        <ThemeToggle />
      </header>
      <Loading />
      <TutorialSlideshow />
    </div>
  )
}