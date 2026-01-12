// /app/play/layout.tsx

import React from "react";
import "@/app/globals.css";

export const metadata = {
  title: "Qiyaas - Play",
  description: "Play Qiyaas!"
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-center overflow-hidden">
      {children}
    </div>
  );
}
