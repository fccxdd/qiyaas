// app/how-to-play/page.tsx

import TutorialWalkthrough from "@/components/game_mode/tutorial/TutorialWalkthrough";
import GameHeader from "@/components/layouts/GameHeader";
import ThemeToggle from "@/components/themes/ThemeToggle";
import Loading from "@/components/game_assets/game_walkthrough/loading";
import Link from "next/link";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";
export default function HowToPlayPage() {
  return (
    <div>
      <GameHeader
        leftContent={ <GoHome/>}
        rightContent={<ThemeToggle/>}
      />
      <Loading />
      <TutorialWalkthrough/>
    </div>
  );
}