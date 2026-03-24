// app/how-to-play/page.tsx

'use client';

import { useState } from "react";
import GameHeader from "@/components/layouts/GameHeader";
import Loading from "@/components/game_assets/game_walkthrough/loading";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";
import TutorialMode from "@/components/game_mode/tutorial/TutorialMode";
import ReadHowToPlay from "@/components/game_assets/game_walkthrough/ReadHowToPlay";

export default function HowToPlayPage() {
  const [modalClosed, setModalClosed] = useState(false);

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
            <ReadHowToPlay variant="howToPlay" onModalClose={() => setModalClosed(true)} />
          </div>
        }
      />
      <Loading />
      <TutorialMode tutorialBoxReady={modalClosed} />
    </div>
  );
}