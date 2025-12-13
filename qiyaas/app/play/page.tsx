// app/play/page.tsx

import PlayMode from "@/components/game_mode/play/PlayMode";
import GameHeader from "@/components/layouts/GameHeader";
import ThemeToggle from "@/components/themes/ThemeToggle";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";
import HelpModal from "@/components/game_assets/game_walkthrough/HelpModal";

export const runtime = 'edge';

export default function PlayPage() {
  return (
    <div>
      <GameHeader
        leftContent={
          <div className="flex items-center gap-3 sm:gap-4">
            <GoHome />
          </div>
        }
        rightContent={
          <div className="flex items-center gap-5 sm:gap-6">
            <HelpModal />
            <ThemeToggle/>
          </div>
        }
      />
      <PlayMode/>
    </div>
  );
}