"use client";

import { Globe, GraduationCap, Award, Plane } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function UniversityStats() {
  const t = useTranslations('UniversityStats');

  const stats = [
    {
      icon: Globe,
      value: "50+",
      title: t('stat1Title'),
      desc: t('stat1Desc')
    },
    {
      icon: GraduationCap,
      value: t('stat2Val'),
      title: t('stat2Title'),
      desc: t('stat2Desc')
    },
    {
      icon: Award,
      value: "100%",
      title: t('stat3Title'),
      desc: t('stat3Desc')
    },
    {
      icon: Plane,
      value: t('stat4Val'),
      title: t('stat4Title'),
      desc: t('stat4Desc')
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
    <section className="w-full py-12 sm:py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header - Split Layout */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start lg:items-center mb-10 sm:mb-16 md:mb-20"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-start text-left">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge')}
              </span>
              <div className="h-[1.5px] w-8 sm:w-12 bg-[#D4AF37]"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight">
              {t('title1')}<br className="hidden md:block" />
              {' '}{t('title2')}
            </h2>
          </motion.div>
          
          <motion.div variants={itemVariants} className="lg:border-l lg:border-gray-200 lg:pl-12">
            <p className="text-gray-600 font-sans text-sm sm:text-base md:text-lg leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </motion.div>

        {/* 4-Column Grid: 1 col on mobile, 2 col on sm, 4 col on lg */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center bg-white p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-[24px] border border-[#D4AF37]/20 shadow-md sm:shadow-xl shadow-black/[0.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Circular Icon with Gold Border */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-[#D4AF37] bg-white flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:bg-[#FCFAF6] transition-colors duration-300">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#0B2545] mb-1 sm:mb-2">
                  {stat.value}
                </h3>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-[#0B2545] mb-2 sm:mb-4 sm:min-h-[44px] flex items-center justify-center">
                  {stat.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
                  {stat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
