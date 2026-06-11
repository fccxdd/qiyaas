import { Indie_Flower, Inknut_Antiqua } from "next/font/google";
import "@/app/globals.css";
import OrientationLock from "@/components/ux/OrientationLock";
import { GameConfig } from "@/lib/gameConfig";
import Footer from "@/components/ux/Footer";
import Script from "next/dist/client/script";

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
      <head>

      {/* Google Tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-77TJZQRQFV"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-77TJZQRQFV');
          `}
        </Script>
        
        <meta property="og:title" content={GameConfig.titleName} />
        <meta property="og:description" content={GameConfig.shareableDescription} />
        <meta property="og:url" content={GameConfig.urlName} />
        <meta property="og:site_name" content={GameConfig.titleName} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://www.qiyaasgame.com/qiyaas_glow_shareable.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Qiyaas Shareable Logo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={GameConfig.titleName} />
        <meta name="twitter:description" content={GameConfig.shareableDescription} />
        <meta name="twitter:image" content="https://www.qiyaasgame.com/qiyaas_glow_shareable.png" />
      </head>
      {/* ↑ Both variables added to make them available everywhere */}
      <body className={indieFlower.className} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <OrientationLock>
          {/* ↑ Only Indie Flower is applied as the default body font */}
          {children}
        </OrientationLock>
          <Footer />
      </body>
    </html>
  );
}