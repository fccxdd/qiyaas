// app/how-to-play/page.tsx

import TutorialWalkthrough from "@/components/game_mode/tutorial/TutorialWalkthrough";
import GameHeader from "@/components/layouts/GameHeader";
import Loading from "@/components/game_assets/game_walkthrough/loading";
import GoHome from "@/components/game_assets/game_walkthrough/GoHome";
import TutorialMode from "@/components/game_mode/tutorial/TutorialMode";

export default function HowToPlayPage() {
  return (
    <div>
      <GameHeader
        leftContent={ 
                        <div className="flex items-center gap-3 sm:gap-4">
                        <GoHome/> 
                        </div>}
        rightContent={
                        <div className="flex items-center gap-5 sm:gap-6">
                        {/* TODO: Put the Read Mode */}
                         </div>
                        }
      />
      <Loading/>
      <TutorialMode/>
      {/* <TutorialWalkthrough/> */}
    </div>
  );
}