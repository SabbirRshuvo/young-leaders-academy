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
      value: "Ivy League & Oxbridge",
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
      value: "Global",
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
    <section className="w-full py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Header - Split Layout */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-20"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-start text-left">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge')}
              </span>
              <div className="h-[1.5px] w-12 bg-[#D4AF37]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight">
              {t('title1')}<br className="hidden md:block" />
              {t('title2')}
            </h2>
          </motion.div>
          
          <motion.div variants={itemVariants} className="lg:border-l lg:border-gray-200 lg:pl-12">
            <p className="text-gray-600 font-sans text-base md:text-lg leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </motion.div>

        {/* 4-Column Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center text-center bg-white p-8 md:p-10 rounded-[24px] border border-[#D4AF37]/20 shadow-xl shadow-black/[0.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Circular Icon with Gold Border */}
                <div className="w-20 h-20 rounded-full border border-[#D4AF37] bg-white flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#FCFAF6] transition-colors duration-300">
                  <Icon className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#0B2545] mb-2">
                  {stat.value}
                </h3>
                <h4 className="text-sm md:text-base font-bold text-[#0B2545] mb-4 min-h-[48px] flex items-center justify-center">
                  {stat.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 font-sans leading-relaxed">
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
