// /app/how-to-play/layout.tsx

import React from "react";

export default function HowToPlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-center">
      {children}
    </div>
  );
}