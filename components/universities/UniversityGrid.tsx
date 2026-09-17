"use client";

import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { universitiesData } from '@/data/universities';

export default function UniversityGrid() {
  const t = useTranslations('UniversityGrid');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const l = (item: { en: string; ar: string }) => isAr ? item.ar : item.en;

  // We map the universitiesData into the format expected by the grid.
  // We'll use the first 3 requirements as pseudo-tags, or just generic tags.
  const getTags = (uniId: string) => {
    switch (uniId) {
      case 'harvard': return isAr ? ['قيادة', 'ابتكار', 'تأثير عالمي'] : ['LEADERSHIP', 'INNOVATION', 'GLOBAL IMPACT'];
      case 'oxford': return isAr ? ['تميز أكاديمي', 'قيادة', 'منظور عالمي'] : ['ACADEMIC EXCELLENCE', 'LEADERSHIP', 'GLOBAL PERSPECTIVE'];
      case 'stanford': return isAr ? ['ابتكار', 'ريادة أعمال', 'قيادة'] : ['INNOVATION', 'ENTREPRENEURSHIP', 'LEADERSHIP'];
      case 'mit': return isAr ? ['تكنولوجيا', 'ابتكار', 'حل المشكلات'] : ['STEM', 'INNOVATION', 'PROBLEM SOLVING'];
      case 'cambridge': return isAr ? ['بحث علمي', 'منحة دراسية', 'تفكير نقدي'] : ['SCHOLARSHIP', 'RESEARCH', 'CRITICAL THINKING'];
      case 'yale': return isAr ? ['قيادة', 'شؤون عالمية', 'تميز أكاديمي'] : ['LEADERSHIP', 'GLOBAL AFFAIRS', 'ACADEMIC EXCELLENCE'];
      default: return [];
    }
  };

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
    <section className="w-full py-16 md:py-24 bg-white overflow-hidden" id="network" dir="ltr">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className={`flex flex-col mb-16 max-w-3xl ${isAr ? 'items-end text-right ml-auto' : 'items-start text-left'}`}
        >
          <motion.div variants={itemVariants} className={`flex items-center gap-4 mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="h-[1.5px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
              {t('badge')}
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className={`text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6 ${isAr ? 'font-arabic' : ''}`}>
            {t('title')}
          </motion.h2>
          <motion.div variants={itemVariants} className={`space-y-4 text-gray-600 font-sans text-base md:text-lg leading-relaxed ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
            <p>
              {t('subtitle1')}
            </p>
            <p>
              {t('subtitle2')}
            </p>
          </motion.div>
        </motion.div>

        {/* 3-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {universitiesData.map((uni, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-300 p-8 flex flex-col h-full hover:-translate-y-1.5 transition-transform duration-300 ${isAr ? 'font-arabic' : ''}`}
            >
              {/* Header: Logo & Name */}
              <div className={`flex items-start gap-4 mb-1 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <img
                  src={uni.logo}
                  alt={uni.name}
                  className="w-[50px] h-[50px] object-contain shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="flex flex-col">
                  <h3 className="font-serif text-[1.35rem] leading-tight text-[#0B2545] font-bold mb-1">
                    {uni.name}
                  </h3>
                  <div className={`text-[13px] text-gray-500 font-medium flex items-center gap-1.5 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                    {l(uni.location)}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className={`text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-4 mt-6 flex-wrap flex gap-1 ${isAr ? 'justify-end' : 'justify-start'}`}>
                {getTags(uni.id).join(' • ')}
              </div>

              {/* Description */}
              <p className={`text-[14px] text-gray-600 leading-relaxed flex-grow mb-8 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
                {l(uni.overview)}
              </p>

              {/* Button */}
              <Link
                href={`/${locale}/universities/${uni.id}`}
                className={`inline-flex items-center gap-2 bg-[#0B2545] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-[#1a365d] ${isAr ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {t('viewBtn')}
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
