"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const badge = t.has('badge')
    ? t('badge')
    : isAr
    ? 'أكاديمية قادة الشباب'
    : 'Young Leaders Academy';

  const titlePart1 = t.has('titlePart1')
    ? t('titlePart1')
    : isAr
    ? 'إعداد الشباب'
    : 'Preparing Young People';

  const titlePart2 = t.has('titlePart2')
    ? t('titlePart2')
    : isAr
    ? 'للحياة.'
    : 'For Life.';

  const subtitle = t.has('subtitle')
    ? t('subtitle')
    : isAr
    ? 'تمكين الشباب ليصبحوا مستعدين للحياة، مستعدين للجامعة، مستعدين للمهنة، ومستعدين للمستقبل.'
    : 'Empowering youth to become life-ready, university-ready, career-ready, and future-ready.';

  const ctaPrimary = t.has('cta') ? t('cta') : isAr ? 'استكشف البرامج' : 'Explore Programs';
  const ctaSecondary = t.has('ctaSecondary') ? t('ctaSecondary') : isAr ? 'ابدأ الاختبار' : 'Take the Quiz';
  const trustText = t.has('trustText')
    ? t('trustText')
    : isAr
    ? 'موثوق به من قبل الشباب الطموح عالمياً'
    : 'Trusted by ambitious youth globally';

  return (
    <section className="relative w-full min-h-[640px] sm:min-h-[700px] md:h-[750px] xl:h-[820px] flex items-center overflow-hidden">
      {/* Background Image with Dark Navy Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-left sm:bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/home-banner.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2545] via-[#0B2545]/95 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/70 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        <div className="relative max-w-2xl lg:max-w-3xl">
          {/* Ambient Glow: Large subtle radial gradient behind the text container */}
          <div
            className="absolute -top-24 -left-20 w-[450px] sm:w-[600px] md:w-[700px] h-[450px] sm:h-[600px] md:h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.14)_0%,rgba(11,37,69,0.3)_45%,transparent_70%)] blur-3xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative flex flex-col items-start space-y-5 sm:space-y-6 p-4 sm:p-6 md:p-0"
          >
            {/* Top Accent Divider */}
            <div className="flex items-center gap-3">
              <span className="w-12 sm:w-16 h-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27]"></span>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                {badge}
              </span>
            </div>

            {/* Typography Highlight: 5xl-7xl with tighter leading & highlighted 'For Life' */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-serif">
              {isAr ? (
                <>
                  <span>{titlePart1}</span>{' '}
                  <span className="text-[#D4AF37]">{titlePart2}</span>
                </>
              ) : (
                <>
                  <span>{titlePart1}</span>{' '}
                  <br className="hidden sm:inline" />
                  <span className="text-[#D4AF37]">{titlePart2}</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* Dual CTAs */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              {/* Primary: Explore Programs */}
              <Link
                href={`/${locale}/programs`}
                className="inline-flex h-12 sm:h-14 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] px-7 sm:px-8 text-sm sm:text-base font-bold text-[#0B2545] shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#D4AF37]/30"
              >
                <span>{ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
              </Link>

              {/* Secondary: Sleek outline button with white/gold text */}
              <Link
                href={`/${locale}/readiness-quiz`}
                className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 rounded-full border-2 border-white/25 hover:border-[#D4AF37] bg-white/5 hover:bg-white/10 px-7 sm:px-8 text-sm sm:text-base font-bold text-white hover:text-[#D4AF37] transition-all duration-300 backdrop-blur-sm shadow-md hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{ctaSecondary}</span>
              </Link>
            </div>

            {/* Trust Badge: 5 gold stars & muted social proof text */}
            <div className="flex items-center gap-2.5 pt-2 sm:pt-3">
              <div className="flex items-center gap-0.5 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-300/90 font-medium tracking-wide">
                {trustText}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}