import Link from 'next/link';
import { User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold bg-navy text-gold font-bold text-xl">
            YLA
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-navy leading-tight tracking-wider">YOUNG LEADERS</div>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-gold"></div>
              <div className="text-xs font-semibold text-gold tracking-[0.2em] leading-tight">ACADEMY</div>
              <div className="h-[1px] w-8 bg-gold"></div>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-navy">
          <Link href="/" className="transition-colors hover:text-gold border-b-2 border-gold py-1">Home</Link>
          <Link href="/about" className="transition-colors hover:text-gold py-1">About</Link>
          <Link href="/programs" className="transition-colors hover:text-gold py-1">Programs</Link>
          <Link href="/universities" className="transition-colors hover:text-gold py-1">Universities</Link>
          <Link href="/contact" className="transition-colors hover:text-gold py-1">Contact</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <button className="text-sm font-bold text-navy hover:text-gold hidden sm:flex items-center gap-2">
            <span className="text-gray-400">🌐</span> EN <span className="text-gray-300 px-1">|</span> ع
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white hover:bg-navy/90 h-10 px-6 py-2 text-sm font-semibold transition-colors">
            <User className="w-4 h-4" />
            Login / Register
          </button>
        </div>
      </div>
    </nav>
  );
}
