"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShieldCheck } from 'lucide-react';

export default function ParentsSupport() {
  const t = useTranslations('ParentsPage');

  const supports = [
    {
      icon: TrendingUp,
      title: t('sup1Title'),
      desc: t('sup1Desc'),
    },
    {
      icon: Users,
      title: t('sup2Title'),
      desc: t('sup2Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('sup3Title'),
      desc: t('sup3Desc'),
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('supportBadge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-[#0B2545] font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t('supportTitle')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl font-sans">
            {t('supportDesc')}
          </p>
        </div>

        {/* Supports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supports.map((support, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 bg-[#072340]/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#072340] transition-colors duration-300">
                <support.icon className="w-7 h-7 text-[#072340] group-hover:text-[#D4AF37] transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0B2545] mb-3 font-serif">
                {support.title}
              </h3>
              <p className="text-gray-600 font-sans leading-relaxed">
                {support.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
