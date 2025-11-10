// /app/tutorial-play/layout.tsx

import React from "react";
import "@/app/globals.css";

export const metadata = {
  title: "Qiyaas - Tutorial",
  description: "Learn how to play Qiyaas"
};

export default function TutorialPlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-center overflow-hidden">
      {children}
    </div>
  );
}