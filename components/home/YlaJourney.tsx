"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { BookOpen, TrendingUp, Globe, ArrowRight } from 'lucide-react';

export default function YlaJourney() {
  const t = useTranslations('YlaJourney');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const steps = [
    { icon: BookOpen, title: "1. Enroll in Programs", desc: "Enroll in Student Development Programs." },
    { icon: TrendingUp, title: "2. Track Progress", desc: "Track Progress & Build a Digital Portfolio." },
    { icon: Globe, title: "3. Match & Apply", desc: "Match & Apply to Partner Universities." }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-[#0B2545] overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {isAr ? 'كيف تعمل الأكاديمية' : 'How YLA Works'}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            {isAr ? 'رحلة الأكاديمية' : 'The YLA Journey'}
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl font-sans">
            {isAr ? 'مسار واضح من 3 خطوات من اكتشاف إمكاناتك إلى القبول في الجامعات العالمية.' : 'A clear 3-step pathway from discovering your potential to matching with global universities.'}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 relative"
        >
          {/* Connecting Line (visible on large screens) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="relative flex flex-col items-center group"
              >
                {/* Number / Icon Container */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:bg-[#D4AF37]/20 transition-all duration-500"></div>
                  <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-all duration-500 overflow-hidden shadow-lg">
                    {/* Animated gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 from-white to-[#D4AF37]"></div>
                    <Icon className="w-10 h-10 text-[#D4AF37] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  </div>
                  
                  {/* Step Connector Arrow for mobile/tablet */}
                  {!isLast && (
                    <div className="lg:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 text-[#D4AF37]/50 z-20">
                      <ArrowRight className="w-6 h-6 animate-bounce rotate-90" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`text-center md:text-center bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl w-full h-full group-hover:bg-white/10 transition-colors duration-500 shadow-xl`}>
                  <h3 className="text-xl font-bold text-white mb-3 font-serif">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Connector Arrow for desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-12 -right-8 w-12 h-12 flex items-center justify-center text-[#D4AF37]/50 z-20">
                    <ArrowRight className="w-6 h-6 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
