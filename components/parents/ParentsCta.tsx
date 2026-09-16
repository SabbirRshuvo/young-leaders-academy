"use client";

import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function ParentsCta() {
  const t = useTranslations('ParentsPage');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="relative w-full py-20 md:py-32 bg-[#072340] overflow-hidden">
      {/* Background Parallax Image */}
      <div className="absolute inset-0 bg-[url('/right.png')] bg-fixed bg-cover bg-right" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#072340] via-[#072340]/80 to-[#072340]/20" />
      
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">
        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-16 backdrop-blur-md text-center shadow-2xl">
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0B2545] border border-[#D4AF37]/30 mb-8 shadow-lg shadow-[#D4AF37]/10">
            <Shield className="w-8 h-8 text-[#D4AF37]" />
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('ctaBadge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>

          <h2 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans">
            {t('ctaDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/contact`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
            >
              {t('ctaBtn1')}
              <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </Link>
            
            <Link
              href={`/${locale}/programs`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-transparent border-2 border-white/20 hover:border-white text-white font-bold text-base transition-all duration-300"
            >
              {t('ctaBtn2')}
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
