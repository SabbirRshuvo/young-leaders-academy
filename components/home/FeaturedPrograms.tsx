"use client";

import Link from 'next/link';
import { GraduationCap, Users, Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';



export default function FeaturedPrograms() {
  const t = useTranslations('FeaturedPrograms');
  const locale = useLocale();

  const programs = [
    { id: 'global-young-leaders-fellowship', title: t('prog1_title'), desc: t('prog1_desc'), icon: GraduationCap, image: '/card1.png' },
    { id: 'high-school-leadership-program', title: t('prog2_title'), desc: t('prog2_desc'), icon: Users, image: '/card2.png' },
    { id: 'global-mentorship-program', title: t('prog3_title'), desc: t('prog3_desc'), icon: Lightbulb, image: '/card3.png' }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#FAF7F2]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#B8902E] font-bold tracking-[0.2em] text-[11px] uppercase">
              {t('tag')}
            </span>
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>

          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl text-[#0B2545]">
            {t('title')}
          </h2>

          <p className="max-w-[700px] text-gray-500 md:text-base font-sans mt-2">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* ================= CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="group flex flex-col bg-white rounded-3xl border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
              >
                {/* Image Section */}
                <div className="w-full h-[220px] relative">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Floating Icon with White Border */}
                  <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 pt-12 flex flex-col flex-1">
                  <h3 className="text-xl font-serif font-bold mb-3 text-[#0B2545]">
                    {prog.title}
                  </h3>

                  <p className="text-[#6B7B8F] mb-8 text-[14px] leading-relaxed flex-1">
                    {prog.desc}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={`/${locale}/programs/${prog.id}`}
                      className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0B2545] to-[#1A3A65] hover:from-[#133055] hover:to-[#0B2545] px-6 text-[13px] font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 w-max group"
                    >
                      {t('viewProgram')}
                      <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}