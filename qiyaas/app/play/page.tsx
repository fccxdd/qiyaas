// app/play/page.tsx

import PlayMode from "@/components/game_mode/play/PlayMode";
import Loading from "@/components/game_assets/game_walkthrough/loading";

export const runtime = 'edge';

export default function PlayPage() {
  return (
    <div>
      <Loading/>
      <PlayMode/>
    </div>
  );
}