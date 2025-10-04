import { Indie_Flower, Inknut_Antiqua } from "next/font/google";
import "@/app/globals.css";
import OrientationLock from "@/components/OrientationLock";

// Indie Flower for playful accent text
const indieFlower = Indie_Flower({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-indie-flower', // Creates CSS variable
})

// Inknut Antiqua for headings and general text
const inknutAntiqua = Inknut_Antiqua({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inknut-antiqua', // Creates CSS variable
})

// Metadata Definition
export const metadata = {
  title: "Qiyaas",
  description: "Wordle meets Hangman"
};

// Viewport Definition
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  orientation: 'portrait'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${indieFlower.variable} ${inknutAntiqua.variable}`}>
      
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      {/* ↑ Both variables added to make them available everywhere */}
      <body className={indieFlower.className}>
        <OrientationLock>
        {/* ↑ Only Indie Flower is applied as the default body font */}
        {children}
        </OrientationLock>
      </body>
    </html>  );
}
