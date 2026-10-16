"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

export default function UniversitiesCta() {
  const t = useTranslations('UniversitiesCta');
  const locale = useLocale();

  return (
    <section className="relative w-full overflow-hidden flex items-center min-h-[450px] md:min-h-[500px]">

      {/* Background Image */}
      <Image
        src="/universities-discuss.png" // Placeholder image for hikers
        alt="Hikers on a mountain summit"
        fill
        sizes="100vw"
        className="object-cover object-right"
        quality={75}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0"></div>

      {/* Content Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 md:py-24 relative z-20">

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-xl flex flex-col justify-center"
        >

          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              {t('badge')}
            </span>
          </div>

          <h2 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            {t('title')}
          </h2>

          <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-8 font-sans">
            {t('subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              href={`/${locale}/programs`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-transform duration-300 hover:scale-105 group"
            >
              {t('cta1')}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={`/${locale}/contact`}
              className="w-full sm:w-auto inline-flex items-center justify-center text-white font-semibold text-sm md:text-base hover:text-gray-200 transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1.5px] after:bg-white after:transition-all hover:after:bg-gray-200"
            >
              {t('cta2')}
            </Link>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
