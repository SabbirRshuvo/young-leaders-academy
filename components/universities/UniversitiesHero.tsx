"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function UniversitiesHero() {
  const t = useTranslations('UniversitiesHero');

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] xl:h-[700px] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/universities-banner.png')` }}
      >
        <div className="absolute inset-0"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="flex flex-col items-start space-y-6 max-w-2xl lg:max-w-3xl"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-2">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              {t('badge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.15]">
            {t('title')}
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-4">
            <p className="text-gray-200 font-bold text-base md:text-lg lg:text-xl">
              {t('subtitle1')}
            </p>
            <p className="text-gray-300 text-sm md:text-base font-sans max-w-2xl leading-relaxed">
              {t('subtitle2')}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-6 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="#network"
              className="w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] px-8 md:px-10 text-sm md:text-base font-bold text-[#0B2545] shadow-lg transition-transform hover:scale-105"
            >
              {t('cta1')}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </Link>
            <Link
              href="#pathways"
              className="w-full sm:w-auto inline-flex h-12 md:h-14 items-center justify-center gap-2 rounded-full border-2 border-white/30 hover:border-white/80 bg-transparent px-8 md:px-10 text-sm md:text-base font-bold text-white transition-all hover:bg-white/10"
            >
              {t('cta2')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
