'use client'

import Script from 'next/script'

const ad_client_id = "ca-pub-2443969664670470";

export default function HomePageAd() {
  return (
    <Script 
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ad_client_id}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}