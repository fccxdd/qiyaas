import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Home() {

    // suspense for 25ms to ensure loading.tsx is shown
  await new Promise((resolve) => setTimeout(resolve, 25));

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 self-start w-full flex justify-end">
             <ThemeToggle />
      </header>
      <main className="flex flex-col gap-[30px] row-start-2 items-center">
        <Image
          className="hidden dark:block "
          src="/qiyaas_logo_darkmode.svg"
          alt="dark-mode-image"
          width={400}
          height={400}
        />
        <Image
          className="mb-4 block dark:hidden "
          src="/qiyaas_logo_lightmode.svg"
          alt="light-mode-image"
          width={400}
          height={400}
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          
          <Link
            className="rounded-full shadow-xl border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:animate-bounce font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/how-to-play"
          >
            How To Play
          </Link>            

          <Link
            className="rounded-full shadow-xl border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent hover:animate-bounce font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/play"
          >
            Play
          </Link>
        </div>
      </main>
      {/* <footer className="row-start-3 flex gap-[20px] flex-wrap items-center justify-center">

          Made with 💗

        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="my_website.com"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </footer> */}
    </div>
  );
}
