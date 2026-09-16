"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Globe, Menu, X } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const tExtra = useTranslations('NavbarExtra');

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname?.replace(`/${locale}`, `/${nextLocale}`) || `/${nextLocale}`;
    router.push(newPath);
  };

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href === '/' ? '' : href}`;
    return pathname === fullHref || (href !== '/' && pathname?.startsWith(fullHref));
  };

  const navLinks = [
    { name: t('home'), href: "/" },
    { name: t('about'), href: "/about" },
    { name: t('programs'), href: "/programs" },
    { name: t('universities'), href: "/universities" },
    { name: t('contact'), href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-[1440px] mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-12">

        {/* Logo - Flex-1 ensures it takes up equal space as the right actions to keep the center links perfectly centered */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center gap-0">
            <Image src="/logo.jpeg" alt="Logo" width={150} height={150} priority className="w-16 h-16 md:w-[120px] md:h-[70px] object-contain" />
            <div className="hidden sm:flex flex-col justify-center -ml-3 md:-ml-4">
              <div className="text-[14px] md:text-[16px] font-extrabold text-navy leading-none tracking-[0.05em] mb-[6px]">YOUNG LEADERS</div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-4 bg-gold"></div>
                <div className="text-[9px] md:text-[10px] font-bold text-gold tracking-[0.2em] leading-none">ACADEMY</div>
                <div className="h-[1px] w-4 bg-gold"></div>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links (Desktop) - Auto width to stay in exact center */}
        <div className="hidden lg:flex items-center justify-center gap-8 text-[15px] font-bold text-navy">
          {navLinks.map((link) => (
            <Link key={link.name} href={`/${locale}${link.href === '/' ? '' : link.href}`} className={`relative transition-colors hover:text-gold py-1 group ${isActive(link.href) ? 'text-gold' : ''}`}>
              {link.name}
              <span className={`absolute left-0 bottom-[-4px] h-[3px] bg-gold rounded-full transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          ))}
        </div>

        {/* Right Actions (Desktop) - Flex-1 and justify-end matches Logo width container */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-4">
          <button
            onClick={switchLocale}
            className="flex items-center justify-center gap-2 px-4 py-[10px] rounded-full border border-gray-200/80 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-[18px] h-[18px] text-navy" />
            <span className={`transition-colors duration-200 text-sm ${locale === 'en' ? 'text-navy font-bold' : 'text-gray-400 font-medium'}`}>EN</span>
            <span className="text-gray-300 font-normal text-sm">|</span>
            <span className={`font-arabic transition-colors duration-200 leading-none mt-[2px] text-[15px] ${locale === 'ar' ? 'text-navy font-bold' : 'text-gray-400 font-medium'}`}>ع</span>
          </button>

          {/* whitespace-nowrap added to prevent text from wrapping */}
          {/* whitespace-nowrap added to prevent text from wrapping */}
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 hidden xl:flex bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="Profile" width={24} height={24} className="rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">
                    {(session.user?.name || "U")[0]}
                  </div>
                )}
                <span className="font-bold text-navy text-sm">
                  {session.user?.name?.split(' ')[0] || "User"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 text-navy hover:bg-gray-200 h-[42px] px-6 text-[15px] font-semibold transition-all shadow-sm border border-gray-200"
              >
                {tExtra('logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="whitespace-nowrap inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white hover:bg-navy/90 h-[42px] px-6 text-[15px] font-semibold transition-all shadow-md"
            >
              <User className="w-[18px] h-[18px]" />
              {tExtra('login')}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex flex-1 items-center justify-end gap-3">
          <button
            onClick={switchLocale}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-navy hover:bg-gray-50 transition-colors"
          >
            {locale === 'en' ? (
              <span className="text-xs font-bold">EN</span>
            ) : (
              <span className="text-sm font-bold font-arabic">ع</span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 text-navy bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Mobile Menu Dropdown */}
      <div
        className={`lg:hidden absolute top-20 left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col z-50 overflow-hidden transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0 border-t-0'
          }`}
      >
        <div className="px-4 flex flex-col gap-4">
          <div className="flex flex-col space-y-1 pb-4 border-b border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={`/${locale}${link.href === '/' ? '' : link.href}`}
                className={`font-bold hover:bg-gray-50 hover:text-gold transition-colors px-4 py-3 rounded-lg flex items-center ${isActive(link.href) ? 'text-gold bg-gray-50' : 'text-navy'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`w-2 h-2 rounded-full mr-3 shrink-0 transition-colors ${isActive(link.href) ? 'bg-gold' : 'bg-transparent'}`}></span>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={switchLocale}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-colors ${locale === 'en' ? 'border-navy bg-navy/5 text-navy font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold'
                  }`}
              >
                <span>English</span>
              </button>
              <button
                onClick={switchLocale}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full border transition-colors ${locale === 'ar' ? 'border-navy bg-navy/5 text-navy font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold'
                  }`}
              >
                العربية
              </button>
            </div>
            {session ? (
              <button
                onClick={() => signOut()}
                className="whitespace-nowrap w-full inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 text-navy hover:bg-gray-200 h-[48px] px-6 text-sm font-semibold transition-colors shadow-sm border border-gray-200"
              >
                {tExtra('logout')} ({session.user?.name?.split(' ')[0] || "User"})
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white hover:bg-navy/90 h-[48px] px-6 text-[15px] font-semibold transition-all shadow-md"
              >
                <User className="w-[18px] h-[18px]" />
                {tExtra('login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
