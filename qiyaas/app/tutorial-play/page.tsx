// app/tutorial-play/page.tsx

import TutorialPlayMode from "@/components/game_mode/tutorial/TutorialPlayMode";
import GameHeader from "@/components/layouts/GameHeader";
import ThemeToggle from "@/components/themes/ThemeToggle";
import QuitTutorial from "@/components/game_assets/game_walkthrough/QuitTutorial";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";

export default function TutorialPlayPage() {
  return (
    <div>
      <GameHeader
        leftContent={
          <div className="flex items-center gap-3">
            <GoHome />
            <QuitTutorial/>
          </div>
        }
        rightContent={<ThemeToggle/>}
      />
      <TutorialPlayMode/>
    </div>
  );
}