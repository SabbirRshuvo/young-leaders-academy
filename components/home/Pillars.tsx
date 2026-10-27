'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
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
  defaultTitleAr: string;
  defaultDescAr: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
}

const PILLAR_CARDS: PillarCardItem[] = [
  {
    id: 'personal-development',
    defaultTitle: 'Personal Development',
    defaultDesc: 'Build confidence, discipline and a growth mindset.',
    defaultTitleAr: 'التطوير الشخصي',
    defaultDescAr: 'بناء الثقة والانضباط وعقلية النمو.',
    icon: User,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'life-skills',
    defaultTitle: 'Life Skills',
    defaultDesc: 'Learn practical skills for real-world success.',
    defaultTitleAr: 'المهارات الحياتية',
    defaultDescAr: 'تعلم مهارات عملية لتحقيق النجاح في العالم الواقعي.',
    icon: Brain,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'leadership',
    defaultTitle: 'Leadership',
    defaultDesc: 'Develop the mindset and skills to lead and create impact.',
    defaultTitleAr: 'القيادة',
    defaultDescAr: 'تطوير العقلية والمهارات للقيادة وخلق التأثير.',
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'health-wellbeing',
    defaultTitle: 'Health & Wellbeing',
    defaultDesc: 'Take care of your mental and physical health.',
    defaultTitleAr: 'الصحة والرفاهية',
    defaultDescAr: 'الاعتناء بصحتك النفسية والبدنية.',
    icon: Heart,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    id: 'creative-critical-thinking',
    defaultTitle: 'Creative & Critical Thinking',
    defaultDesc: 'Solve problems, think deeper, be more innovative.',
    defaultTitleAr: 'التفكير الإبداعي والنقدي',
    defaultDescAr: 'حل المشكلات، والتفكير بعمق، وزيادة الابتكار.',
    icon: Lightbulb,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
  },
  {
    id: 'communication',
    defaultTitle: 'Communication',
    defaultDesc: 'Express your ideas and build stronger relationships.',
    defaultTitleAr: 'التواصل',
    defaultDescAr: 'التعبير عن أفكارك وبناء علاقات أقوى.',
    icon: MessageCircle,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    id: 'global-awareness',
    defaultTitle: 'Global Awareness',
    defaultDesc: 'Understand the world and your place in it.',
    defaultTitleAr: 'الوعي العالمي',
    defaultDescAr: 'فهم العالم ومكانتك فيه.',
    icon: Globe,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'career-readiness',
    defaultTitle: 'Career Readiness',
    defaultDesc: 'Gain skills, experience and confidence for your career.',
    defaultTitleAr: 'الجاهزية المهنية',
    defaultDescAr: 'اكتساب المهارات والخبرة والثقة لمسيرتك المهنية.',
    icon: Star,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export default function Pillars() {
  const t = useTranslations('Pillars');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const overline = t.has('overline')
    ? t('overline')
    : isAr
    ? 'التنمية الشاملة'
    : 'HOLISTIC DEVELOPMENT';

  const title = t.has('title')
    ? t('title')
    : isAr
    ? 'انمو في كل مجال من مجالات الحياة'
    : 'Grow in Every Area of Life';

  const desc = t.has('desc')
    ? t('desc')
    : isAr
    ? 'نحن نركز على شخصيتك المتكاملة — بناء المهارات والعقلية والتجارب التي تحتاجها لمستقبل ناجح.'
    : 'We focus on the complete you — building the skills, mindset and experiences you need for a successful future.';

  const moreThanAcademics = t.has('moreThanAcademics')
    ? t('moreThanAcademics')
    : isAr
    ? 'أكثر من مجرد دراسة أكاديمية'
    : 'More than just academics';

  const cardsRaw = (() => {
    try {
      const res = t.raw('cards');
      return Array.isArray(res) ? res : null;
    } catch {
      return null;
    }
  })();

  return (
    <section className={`w-full bg-[#F8F9FA] py-16 sm:py-20 lg:py-24 ${isAr ? 'font-arabic' : 'font-sans'}`}>
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
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-[#0B2545] tracking-tight mb-3 leading-tight">
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

            const cardTitle =
              cardsRaw?.[index]?.title ||
              (t.has(`cards.${index}.title`) ? t(`cards.${index}.title`) : null) ||
              (t.has(`card_${card.id}_title`) ? t(`card_${card.id}_title`) : null) ||
              (isAr ? card.defaultTitleAr : card.defaultTitle);

            const cardDesc =
              cardsRaw?.[index]?.desc ||
              (t.has(`cards.${index}.desc`) ? t(`cards.${index}.desc`) : null) ||
              (t.has(`card_${card.id}_desc`) ? t(`card_${card.id}_desc`) : null) ||
              (isAr ? card.defaultDescAr : card.defaultDesc);

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