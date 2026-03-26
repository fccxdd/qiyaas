import { Indie_Flower, Inknut_Antiqua } from "next/font/google";
import "@/app/globals.css";
import OrientationLock from "@/components/ux/OrientationLock";
import { GameConfig } from "@/lib/gameConfig";

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
  
  metadataBase: new URL(GameConfig.urlName),
  title: GameConfig.titleName,
  description: GameConfig.shareableDescription,
  icons: {
            icon: '/favicon.ico',
            apple: '/apple-icon.png',
        },
  openGraph: {
    title: GameConfig.titleName,
    description: GameConfig.shareableDescription,
    url: GameConfig.urlName,
    siteName: GameConfig.titleName,
    images: [
                {
                url: 'https://www.qiyaasgame.com/qiyaas_glow_shareable.png',
                width: 1200,
                height: 630,
                alt: 'Qiyaas Shareable Logo',
                },
                {
                url: 'https://www.qiyaasgame.com/qiyaas_glow_shareable_square.png',
                width: 400,
                height: 400,
                alt: 'Qiyaas Shareable Square Logo',
                }
            ],
    locale: 'en_US',
    type: 'website',
},

  twitter: {
    card: 'summary_large_image',
    title: GameConfig.titleName,
    description: GameConfig.shareableDescription,
    images: [`${GameConfig.urlName}/${GameConfig.imagePaths.shareable}`],
  },
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
    <html lang="en" className={`dark ${indieFlower.variable} ${inknutAntiqua.variable}`}>
      
      {/* Large format - for Facebook posts, Twitter, LinkedIn */}
      <meta property="og:image" content="https://www.qiyaasgame.com/qiyaas_glow_shareable.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Qiyaas Shareable Logo" />

      {/* Square format - for Facebook thumbnails, WhatsApp */}
      <meta property="og:image" content="https://www.qiyaasgame.com/qiyaas_glow_shareable_square.png" />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
      <meta property="og:image:alt" content="Qiyaas Shareable Square Logo" />
      {/* ↑ Both variables added to make them available everywhere */}
      <body className={indieFlower.className}>
        <OrientationLock>
        {/* ↑ Only Indie Flower is applied as the default body font */}
        {children}
        </OrientationLock>
      </body>
    </html>  );
}
