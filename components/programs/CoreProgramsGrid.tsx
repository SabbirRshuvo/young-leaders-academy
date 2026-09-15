"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

interface CoreProgramsGridProps {
  selectedCategory: string;
}

export default function CoreProgramsGrid({ selectedCategory }: CoreProgramsGridProps) {
  const t = useTranslations('CoreProgramsGrid');
  const tHero = useTranslations('ProgramsHero');
  const locale = useLocale();

  const allPrograms = [
    {
      title: t('prog1Title'),
      categoryId: "high_school",
      categoryLabel: tHero('cat2'),
      description: t('prog1Desc'),
      duration: t('time4w'),
      age: "14 – 18",
      level: t('lvlBeginner'),
      image: "/high-school.png",
      href: "/programs/high-school-leadership-program"
    },
    {
      title: t('prog2Title'),
      categoryId: "mentorship",
      categoryLabel: tHero('cat3'),
      description: t('prog2Desc'),
      duration: t('time8w'),
      age: "16 – 25",
      level: t('lvlIntermediate'),
      image: "/global-mentor.png",
      href: "/programs/global-mentorship-program"
    },
    {
      title: t('prog3Title'),
      categoryId: "executive",
      categoryLabel: tHero('cat4'),
      description: t('prog3Desc'),
      duration: t('time6w'),
      age: "16 – 28",
      level: t('lvlAll'),
      image: "/future-skill.png",
      href: "/programs/future-skills-executive-program"
    },
    {
      title: t('prog4Title'),
      categoryId: "summer",
      categoryLabel: tHero('cat5'),
      description: t('prog4Desc'),
      duration: t('time2w'),
      age: "12 – 16",
      level: t('lvlBeginner'),
      image: "/summer.png",
      href: "/programs/summer-leadership-camp"
    }
  ];

  // Filter programs based on selected category
  const filteredPrograms = selectedCategory === 'all'
    ? allPrograms
    : allPrograms.filter(prog => prog.categoryId === selectedCategory);

  return (
    <section className="w-full bg-[#FAF7F2] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('badge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] mb-4">
            {selectedCategory === 'all' ? t('titlePrefix') : tHero(
              selectedCategory === 'high_school' ? 'cat2' :
              selectedCategory === 'mentorship' ? 'cat3' :
              selectedCategory === 'executive' ? 'cat4' :
              'cat5'
            )}
          </h2>
          <p className="text-gray-600 max-w-2xl text-base md:text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid with Framer Motion AnimatePresence */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.title}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex flex-col bg-white rounded-[24px] shadow-xl shadow-black/[0.04] border border-[#D4AF37]/30 overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Image Box */}
                <div className="relative w-full h-[240px] overflow-hidden">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    priority={index < 4}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#D4AF37] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-sm">
                    {program.categoryLabel.toUpperCase()}
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex flex-col flex-1 p-6 sm:p-8">
                  <h3 className="text-[#0B2545] font-serif font-bold text-xl md:text-2xl mb-3 leading-tight">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 flex-1">
                    {program.description}
                  </p>

                  {/* Meta Grid */}
                  <div className="grid grid-cols-3 gap-2 py-5 border-t border-gray-100 mb-6">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('duration')}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.duration}</span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('ageGroup')}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.age}</span>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('level')}</span>
                      </div>
                      <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.level}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/${locale}${program.href}`}
                    className="inline-flex items-center justify-center gap-2 w-max px-6 py-2.5 rounded-full bg-[#0B2545] hover:bg-[#071931] text-white font-semibold text-sm transition-colors group/btn"
                  >
                    {t('cta')}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredPrograms.length === 0 && (
          <div className="w-full text-center py-12">
            <p className="text-gray-500">{t('noPrograms')}</p>
          </div>
        )}

      </div>
    </section>
  );
}
