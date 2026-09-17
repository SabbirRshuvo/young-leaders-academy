"use client";

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  return (
    <section className="relative w-full h-[600px] md:h-[700px] xl:h-[800px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url('/banner.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2545] via-[#0B2545]/60 to-transparent "></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-start space-y-6 max-w-2xl p-6 md:p-0"
        >
          <div className="w-16 h-1 bg-[#D4AF37] mb-2"></div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-[1.1]">
            {t('title').split(' ').slice(0, 2).join(' ')}<br />{t('title').split(' ').slice(2).join(' ')}
          </h1>

          <p className="text-gray-200 font-bold text-lg md:text-xl max-w-[500px]">
            {t('subtitle')}
          </p>

          <div className="pt-4">
            <Link
              href={`/${locale}/programs`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] px-8 text-base font-bold text-[#0B2545] shadow-lg transition-transform hover:scale-105"
            >
              {t('cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}