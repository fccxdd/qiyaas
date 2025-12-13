// components/contact/EmailButton.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import EmailIcon from '@mui/icons-material/Email';

export default function EmailButton() {
  const [isMobile, setIsMobile] = useState(false);
  const email = "info@qiyaasgame.com";

  useEffect(() => {
    // Detect if user is on mobile
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkMobile();
  }, []);

  // Mobile: use mailto
  // Desktop: use Gmail web link
  const href = isMobile 
    ? `mailto:${email}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  
  const target = isMobile ? undefined : "_blank";
  const rel = isMobile ? undefined : "noopener noreferrer";

  return (
    <Link
      className="fixed bottom-8 right-8 rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 w-8 sm:h-11 sm:w-11 z-50"
      href={href}
      target={target}
      rel={rel}
      aria-label="Contact"
    >
      <EmailIcon className="text-lg sm:text-xl" />
    </Link>
  );
}