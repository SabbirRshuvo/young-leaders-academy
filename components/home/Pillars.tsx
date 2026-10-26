'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  User,
  Brain,
  Users,
  Heart,
  Lightbulb,
  MessageCircle,
  Globe,
  Star,
} from 'lucide-react';

interface PillarCardItem {
  id: string;
  defaultTitle: string;
  defaultDesc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
}

const PILLAR_CARDS: PillarCardItem[] = [
  {
    id: 'personal-development',
    defaultTitle: 'Personal Development',
    defaultDesc: 'Build confidence, discipline and a growth mindset.',
    icon: User,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'life-skills',
    defaultTitle: 'Life Skills',
    defaultDesc: 'Learn practical skills for real-world success.',
    icon: Brain,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'leadership',
    defaultTitle: 'Leadership',
    defaultDesc: 'Develop the mindset and skills to lead and create impact.',
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'health-wellbeing',
    defaultTitle: 'Health & Wellbeing',
    defaultDesc: 'Take care of your mental and physical health.',
    icon: Heart,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    id: 'creative-critical-thinking',
    defaultTitle: 'Creative & Critical Thinking',
    defaultDesc: 'Solve problems, think deeper, be more innovative.',
    icon: Lightbulb,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    id: 'communication',
    defaultTitle: 'Communication',
    defaultDesc: 'Express your ideas and build stronger relationships.',
    icon: MessageCircle,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    id: 'global-awareness',
    defaultTitle: 'Global Awareness',
    defaultDesc: 'Understand the world and your place in it.',
    icon: Globe,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'career-readiness',
    defaultTitle: 'Career Readiness',
    defaultDesc: 'Gain skills, experience and confidence for your career.',
    icon: Star,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export default function Pillars() {
  const t = useTranslations('Pillars');

  const overline = t.has('overline') ? t('overline') : 'HOLISTIC DEVELOPMENT';
  const title = t.has('title') ? t('title') : 'Grow in Every Area of Life';
  const desc = t.has('desc')
    ? t('desc')
    : 'We focus on the complete you — building the skills, mindset and experiences you need for a successful future.';
  const moreThanAcademics = t.has('moreThanAcademics')
    ? t('moreThanAcademics')
    : 'More than just academics';

  return (
    <section className="w-full bg-[#F8F9FA] py-16 sm:py-20 lg:py-24 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ================= HEADER AREA ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex-1 max-w-3xl text-left rtl:text-right"
          >
            {/* Overline */}
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {overline}
            </p>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0B2545] tracking-tight mb-3 leading-tight">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl">
              {desc}
            </p>
          </motion.div>

          {/* Handwritten Note with Curved Arrow pointing to cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center rotate-6 pointer-events-none select-none shrink-0 self-start md:self-auto mb-2"
          >
            <span className="font-serif italic text-base xl:text-lg text-[#6A829D] font-medium tracking-wide">
              {moreThanAcademics}
            </span>
            <svg
              width="38"
              height="46"
              viewBox="0 0 40 50"
              fill="none"
              className="text-[#6A829D]/75 -rotate-12 mt-1 mr-4"
              aria-hidden="true"
            >
              <path
                d="M28 4C26 16 18 30 8 38M8 38L15 36M8 38L9 30"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>

        {/* ================= 8-CARD STRICT CSS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLAR_CARDS.map((card, index) => {
            const Icon = card.icon;
            const cardTitle = t.has(`cards.${index}.title`)
              ? t(`cards.${index}.title`)
              : card.defaultTitle;
            const cardDesc = t.has(`cards.${index}.desc`)
              ? t(`cards.${index}.desc`)
              : card.defaultDesc;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left rtl:text-right group"
              >
                {/* Circular Icon Wrapper */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 mb-6 transition-transform duration-300 group-hover:scale-105 ${card.iconBg}`}
                >
                  <Icon className={`w-8 h-8 ${card.iconColor}`} strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#0B2545] mb-2 leading-snug">
                  {cardTitle}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed">
                  {cardDesc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}