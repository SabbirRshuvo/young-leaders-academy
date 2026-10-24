"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function GlobalMobility() {
  const t = useTranslations('GlobalMobility');
  const locale = useLocale();

  const benefits = [
    {
      title: t('ben1Title'),
      desc: t('ben1Desc')
    },
    {
      title: t('ben2Title'),
      desc: t('ben2Desc')
    },
    {
      title: t('ben3Title'),
      desc: t('ben3Desc')
    },
    {
      title: t('ben4Title'),
      desc: t('ben4Desc')
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section id="pathways" className="w-full py-12 sm:py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full max-w-full">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center w-full">

          {/* Left: Text & Button */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-4 flex flex-col items-start w-full"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge')}
              </span>
              <div className="h-[1.5px] w-8 sm:w-12 bg-[#D4AF37]"></div>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-4 sm:mb-6">
              {t('title')}
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4 text-gray-600 font-sans text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8">
              <p>
                {t('subtitle1')}
              </p>
              <p>
                {t('subtitle2')}
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <Link
                href={`/${locale}/apply`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#0B2545] to-[#1A3A65] text-white font-bold text-xs sm:text-sm md:text-base hover:from-[#133055] hover:to-[#0B2545] shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <span>{t('cta')}</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Middle: Checklist */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-4 flex flex-col gap-4 sm:gap-6 lg:px-6 w-full"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 mt-0.5 sm:mt-1">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-[#0B2545] font-bold text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-4 relative pl-3 sm:pl-4 pb-3 sm:pb-4 mt-6 sm:mt-8 lg:mt-0 w-full"
          >
            {/* Offset Gold Border Frame */}
            <div className="absolute top-2 sm:top-4 left-4 sm:left-8 right-0 bottom-0 border-2 border-[#D4AF37] z-0"></div>

            {/* Image Container */}
            <div className="relative z-10 w-full h-[260px] sm:h-[380px] lg:h-[480px] bg-white shadow-xl rounded-lg overflow-hidden">
              <Image
                src="/universities-chat.png"
                alt="Students discussing"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
