// /app/how-to-play/layout.tsx

import React from "react";
import "@/app/globals.css";

export const metadata = {
  title: "Qiyaas - Tutorial",
  description: "Learn how to play Qiyaas"
};

export default function HowToPlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-center overflow-hidden">
      {children}
    </div>
  );
}