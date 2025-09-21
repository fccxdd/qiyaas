import type { Metadata } from "next";
import { Indie_Flower, Inknut_Antiqua } from "next/font/google";
import "@/app/globals.css";
import OrientationLock from "@/components/OrientationLock";

const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-indie-flower', // Creates CSS variable
})

const inknutAntiqua = Inknut_Antiqua({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inknut-antiqua', // Creates CSS variable
})

export const metadata: Metadata = {
  title: "Qiyaas",
  description: "Wordle meets Hangman",
  viewport: 'width=device-width, initial-scale=1, orientation=portrait'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${indieFlower.variable} ${inknutAntiqua.variable}`}>
      {/* ↑ Both variables added to make them available everywhere */}
      <body className={indieFlower.className}>
        <OrientationLock>
        {/* ↑ Only Indie Flower is applied as the default body font */}
        {children}
        </OrientationLock>
      </body>
    </html>  );
}
