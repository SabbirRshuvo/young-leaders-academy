"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function GlobalMobility() {
  const t = useTranslations('GlobalMobility');

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
    <section className="w-full py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left: Text & Button */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-4 flex flex-col items-start"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge')}
              </span>
              <div className="h-[1.5px] w-12 bg-[#D4AF37]"></div>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6">
              {t('title')}
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 text-gray-600 font-sans text-sm md:text-base leading-relaxed mb-8">
              <p>
                {t('subtitle1')}
              </p>
              <p>
                {t('subtitle2')}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href="#mobility"
                className="inline-flex items-center gap-2 px-8 py-3.5 md:py-4 rounded-full bg-[#0B2545] text-white font-bold text-sm md:text-base hover:bg-[#071931] transition-colors group"
              >
                {t('cta')}
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
            className="lg:col-span-4 flex flex-col gap-6 lg:px-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[#0B2545] font-bold text-sm md:text-base mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
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
            className="lg:col-span-4 relative pl-4 pb-4 mt-8 lg:mt-0"
          >
            {/* Offset Gold Border Frame */}
            <div className="absolute top-4 left-8 right-0 bottom-0 border-2 border-[#D4AF37] z-0"></div>

            {/* Image Container */}
            <div className="relative z-10 w-full h-[350px] sm:h-[450px] lg:h-[500px] bg-white shadow-xl">
              <Image
                src="/universities-chat.png" // Placeholder
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
