import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/themes/ThemeToggle";
import EmailButton from "@/components/contact/EmailButton";

export default async function Home() {

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 relative">
      
        <header className="row-start-1 self-start w-full flex justify-end">
              <ThemeToggle />
        </header>
        <main className="flex flex-col gap-[30px] row-start-2 items-center">
        
          <Image
            className="block dark:hidden"
            src="qiyaas_logo_66_percent_light.svg"
            alt="qiyaas-logo-light"
            width={178}
            height={151}
          />

          <Image
            className="hidden dark:block"
            src="qiyaas_logo_dark.svg"
            alt="qiyaas-logo-dark"
            width={178}
            height={151}
          />
          <div className="flex gap-4 items-center flex-row">
            
            <Link
              className="rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center text-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 sm:h-11 px-5 sm:px-4 w-[140px] whitespace-nowrap"
              href="/how-to-play"
            >
              How To Play
            </Link>

            <Link
              className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-all flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:-translate-y-1 hover:shadow-2xl font-medium text-base sm:text-lg h-11 sm:h-11 px-5 sm:px-4 w-[140px] whitespace-nowrap"
              href="/play"
            >
              Play
            </Link>
        </div>
      </main>
        <EmailButton/>
    </div>
  );
}