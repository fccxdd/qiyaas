// app/loading.tsx

export default function Loading() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white">
      {/* Header (ThemeToggle placeholder) */}
      <header className="row-start-1 self-start w-full flex justify-end">
        <div className="w-10 h-10 bg-gray-700 animate-pulse rounded-full" />
      </header>

      {/* Main content */}
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        {/* Logo placeholder */}
        <div className="hidden dark:block w-[400px] h-[400px] bg-gray-700 animate-pulse rounded-lg" />
        <div className="mb-4 block dark:hidden w-[400px] h-[400px] bg-gray-700 animate-pulse rounded-lg" />

        {/* Buttons placeholders */}
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <div className="h-12 w-[158px] bg-gray-700 animate-pulse rounded-full" />
          <div className="h-12 w-[158px] bg-gray-700 animate-pulse rounded-full" />
        </div>
      </main>
    </div>
  );
}
