"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Globe, Lightbulb, BookOpen } from 'lucide-react';

export default function StudentsBenefits() {
  const t = useTranslations('StudentsPage');

  const benefits = [
    {
      icon: Globe,
      title: t('ben1Title'),
      desc: t('ben1Desc'),
    },
    {
      icon: Lightbulb,
      title: t('ben2Title'),
      desc: t('ben2Desc'),
    },
    {
      icon: BookOpen,
      title: t('ben3Title'),
      desc: t('ben3Desc'),
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('benefitsBadge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-[#0B2545] font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('benefitsTitle')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl font-sans">
            {t('benefitsDesc')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-300 hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 bg-[#0B2545]/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0B2545] transition-colors duration-300">
                <benefit.icon className="w-7 h-7 text-[#0B2545] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2545] mb-3 font-serif">
                {benefit.title}
              </h3>
              <p className="text-gray-600 font-sans leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
