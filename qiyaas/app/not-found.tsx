// /not-found.tsx

import Image from "next/image";
import ThemeToggle from "@/components/themes/ThemeToggle";
import { GameConfig } from "@/lib/gameConfig";

export default function Custom404() {
  return (
<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
	
	<header className="row-start-1 self-start w-full flex justify-end">
		<ThemeToggle />
	</header>
	
	<main className="flex flex-col gap-[30px] row-start-2 items-center">
	
		<Image
		  className="block"
		  src={GameConfig.imagePaths.image404}
		  alt="qiyaas-404"
		  width={500}
		  height={500}
		/>
	
		<div className="flex align-center items-center">
			<h1 className="text-2xl font-bold">Its not you, its just a 404-Error</h1>
		</div>
	</main>
</div>

)
}