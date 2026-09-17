"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

export default function WhoWeServe() {
  const t = useTranslations('WhoWeServe');
  const locale = useLocale();
  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Grid Layout - Gap added for clear separation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">

          {/* Card 1: Students */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative w-full h-full min-h-[450px] bg-white overflow-hidden rounded-[24px] border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
          >
            {/* Image Layer - Limited width so it doesn't stretch too far behind text on large screens */}
            <div className="absolute inset-y-0 left-0 w-full h-full">
              <img
                src="/left.png"
                alt="Students"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-white/80 md:via-white/70 to-white" />

            {/* Content Layer */}
            <div className="relative z-10 w-full md:w-[55%] md:ml-auto h-full flex flex-col justify-end md:justify-center p-8 lg:p-12 pt-[220px] md:pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1.5px] w-8 bg-[#C59B27]" />
                <span className="text-[#C59B27] font-bold tracking-widest text-xs uppercase">
                  {t('tag')}
                </span>
              </div>

              <h3 className="text-4xl font-serif font-bold text-[#0B2545] mb-2">
                {t('studentsTitle')}
              </h3>
              <p className="text-base font-semibold text-[#0B2545] mb-4">
                {t('studentsSubtitle')}
              </p>
              <p className="text-sm font-sans text-gray-600 mb-8 leading-relaxed max-w-[400px]">
                {t('studentsDesc')}
              </p>

              <div>
                <Link
                  href={`/${locale}/students`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C59B27] text-sm font-semibold text-[#0B2545] hover:bg-[#C59B27]/10 transition-colors"
                >
                  {t('exploreMore')} <ArrowRight className="w-4 h-4 text-[#C59B27]" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Partners & Institutions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative w-full h-full min-h-[450px] bg-[#0B2545] overflow-hidden rounded-[24px] border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
          >
            {/* Image Layer */}
            <div className="absolute inset-y-0 left-0 w-full h-full">
              <img
                src="/right.png"
                alt="Parents"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-[#072340]/80 md:via-[#072340]/70 to-[#072340]" />

            {/* Content Layer */}
            <div className="relative z-10 w-full md:w-[55%] md:ml-auto h-full flex flex-col justify-end md:justify-center p-8 lg:p-12 pt-[220px] md:pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1.5px] w-8 bg-[#C59B27]" />
              </div>

              <h3 className="text-4xl font-serif font-bold text-white mb-2">
                {t('parentsTitle')}
              </h3>
              <p className="text-base font-semibold text-white mb-4">
                {t('parentsSubtitle')}
              </p>
              <p className="text-sm font-sans text-gray-300 mb-8 leading-relaxed max-w-[400px]">
                {t('parentsDesc')}
              </p>

              <div>
                <Link
                  href={`/${locale}/parents`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C59B27] text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  {t('exploreMore')} <ArrowRight className="w-4 h-4 text-[#C59B27]" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}