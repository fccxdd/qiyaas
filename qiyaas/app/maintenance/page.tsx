// app/maintenance/page.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qiyaas - Under Maintenance',
};

export default function MaintenancePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            margin: 0;
            padding: 0;
            background: #000000;
            height: 100%;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
        `
      }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      <div style={{
        textAlign: 'center',
        padding: '40px',
        maxWidth: '600px',
        color: 'white'
      }}>
        <div style={{ fontSize: '4em', marginBottom: '20px' }}>🛠️</div>
        <h1 style={{ 
          fontSize: '3em', 
          margin: '0 0 20px 0',
          fontFamily: "'Inknut Antiqua', serif"
        }}>
          We will be back soon!
        </h1>
      </div>
    </>
  );
}