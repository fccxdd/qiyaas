// app/loading.tsx

export default function Loading() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white">
      {/* Header (ThemeToggle placeholder) */}
      <header className="row-start-1 self-start w-full flex justify-end">
        <div className="w-11 h-6 bg-gray-700 animate-pulse rounded-full" />
      </header>

      {/* Main content */}
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        {/* Logo placeholder */}
        <div className="block w-[178px] h-[151px] mx-auto bg-gray-700 animate-pulse rounded-lg" />

        {/* Buttons placeholders */}
        <div className="flex gap-4 items-center flex-row">
          <div className="h-12 w-[158px] bg-gray-700 animate-pulse rounded-full" />
          <div className="h-12 w-[158px] bg-gray-700 animate-pulse rounded-full" />
        </div>
      </main>
    </div>
  );
}
