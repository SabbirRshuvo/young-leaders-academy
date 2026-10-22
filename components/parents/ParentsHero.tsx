"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';

export default function ParentsHero() {
  const t = useTranslations('ParentsPage');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center bg-[#072340] overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/right.png" 
          alt="Parents Hero" 
          className="w-full h-full object-cover object-center md:object-top -scale-x-100"
        />
      </div>
      {/* Fade Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#072340] via-[#072340]/90 to-[#072340]/40" />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px] flex">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-start py-20 mr-auto ml-0"
          dir="ltr"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('heroBadge')}
            </span>
          </div>

          <h1 className="text-white font-serif text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-bold leading-tight md:leading-snug mb-6 md:mb-8">
            {t('heroTitle1')} <br className="hidden md:block" />
            <span className="text-[#D4AF37]">{t('heroTitle2')}</span>
          </h1>

          <p className="text-gray-200 text-base md:text-lg lg:text-[19px] leading-relaxed mb-8 md:mb-10 max-w-xl lg:max-w-2xl font-sans">
            {t('heroDesc')}
          </p>

          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg group"
          >
            {t('heroCta')}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
