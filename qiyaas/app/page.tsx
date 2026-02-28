import EmailButton from "@/components/contact/EmailButton";
import QiyaasLogo from "@/components/ux/QiyaasLogo";
import PuzzleDisplay from "@/components/puzzle_data/PuzzleDisplay";
import HomePageAd from "@/components/ads/HomePageAd";

export const runtime = 'edge'; // Use Cloudflare's edge runtime
export const dynamic = 'force-dynamic'; // Force dynamic rendering on each request

export default async function Home() {
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 relative">
           
      <main className="flex flex-col gap-8 sm:gap-10 row-start-2 items-center">
        
        <QiyaasLogo className="w-[200px] h-[100px] sm:w-[400px] sm:h-[193px]"/>
        
        <PuzzleDisplay />
        
        <HomePageAd/>
      </main>
      
      <EmailButton/>
    </div>
  );
}