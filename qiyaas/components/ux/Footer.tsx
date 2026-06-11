// components/Footer.tsx

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex items-center justify-center gap-4 px-6 py-3 border-t border-white/10 text-[11px] text-white/40"
      style={{ fontFamily: "'Inknut Antiqua', serif" }}>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#74A8DC', boxShadow: '0 0 6px 2px rgba(116,168,220,0.7)' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#6AA84F', boxShadow: '0 0 6px 2px rgba(106,168,79,0.7)' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E06666', boxShadow: '0 0 6px 2px rgba(224,102,102,0.7)' }} />
      </span>
      <p className="whitespace-nowrap">© {new Date().getFullYear()} <Link href="/" className="hover:text-white/70 transition-colors">Qiyaas</Link></p>
      <span className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
      <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
      <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
      <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
    </footer>
  );
}