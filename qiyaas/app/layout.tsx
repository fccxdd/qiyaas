import type { Metadata } from "next";
import { Indie_Flower } from "next/font/google";
import "@/app/globals.css";

const indieFlower = Indie_Flower({
  subsets: ["latin"],
  weight: "400",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Qiyaas",
  description: "Wordle meets Hangman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${indieFlower.className}`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
