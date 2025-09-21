// /not-found.tsx

import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function Custom404() {
  return (
<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
	
	<header className="row-start-1 self-start w-full flex justify-end">
		<ThemeToggle />
	</header>
	
	<main className="flex flex-col gap-[32px] row-start-2 items-center">
	
		<Image
			className="hidden dark:block "
			src="/qiyaas_404_logo.svg"
			alt="dark-mode-image"
			width={400}
			height={400}
		/>
		<Image
			className="mb-4 block dark:hidden "
			src="/qiyaas_404_logo.svg"
			alt="light-mode-image"
			width={400}
			height={400}
		/>
	
		<div className="flex align-center items-center">
			<h1 className="text-2xl font-bold ">Its not you, its just a 404-Error</h1>
		</div>
	</main>
</div>

)
}