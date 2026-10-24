"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, Award, ArrowRight, Loader2, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { getLocalizedProgramText, getLocalizedCategory } from '@/lib/program-localization';

interface CoreProgramsGridProps {
  selectedCategory: string;
}

export default function CoreProgramsGrid({ selectedCategory }: CoreProgramsGridProps) {
  const t = useTranslations('CoreProgramsGrid');
  const tHero = useTranslations('ProgramsHero');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    // You can add a filter like .eq('is_published', true) if needed
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPrograms(data);
    }
    setLoading(false);
  };

  // Filter programs (if you have categories in DB later, filter here. For now, we show all if 'all' is selected)
  const filteredPrograms = selectedCategory === 'all'
    ? programs
    : programs.filter(prog => prog.category === selectedCategory);

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

        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            </div>
        ) : (
            <>
                {/* Grid with Framer Motion AnimatePresence */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredPrograms.map((program, index) => (
                    <motion.div
                        key={program.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group flex flex-col bg-white rounded-[24px] shadow-xl shadow-black/[0.04] border border-[#D4AF37]/30 overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-shadow duration-300"
                    >
                        {/* Image Box */}
                        <div className="relative w-full h-[240px] overflow-hidden bg-gray-100">
                        <img
                            src={program.image_url || "/default-program.jpg"}
                            alt={program.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4 bg-[#D4AF37] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-sm">
                            {getLocalizedCategory(program.category, isAr)}
                        </div>
                        </div>

                        {/* Content Box */}
                        <div className="flex flex-col flex-1 p-6 sm:p-8">
                        <h3 className="text-[#0B2545] font-serif font-bold text-xl md:text-2xl mb-3 leading-tight line-clamp-2">
                            {getLocalizedProgramText(program.title, isAr, 'title', program.title)}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 flex-1 line-clamp-3">
                            {getLocalizedProgramText(program.description, isAr, 'description', program.title)}
                        </p>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2 py-5 border-t border-gray-100 mb-6">
                            <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('duration')}</span>
                            </div>
                            <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.duration || (isAr ? "4 أسابيع" : "4 Weeks")}</span>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('ageGroup')}</span>
                            </div>
                            <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.age_group || (isAr ? "جميع الأعمار" : "All Ages")}</span>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('fee')}</span>
                            </div>
                            <span className="text-xs font-bold text-[#0B2545] ml-5.5">{program.price ? `$${program.price}` : t('free')}</span>
                            </div>
                        </div>

                        {/* Button */}
                        <Link
                            href={`/${locale}/programs/${program.id}`}
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-[#0B2545] hover:bg-[#071931] text-white font-semibold text-sm transition-colors group/btn"
                        >
                            {t('viewDetails')}
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
            </>
        )}

      </div>
    </section>
  );
}
