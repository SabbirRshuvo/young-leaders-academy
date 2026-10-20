"use client";

import Link from 'next/link';
import { ArrowRight, GraduationCap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { programsData } from '@/data/programs';
import { getLocalizedProgramText, getLocalizedCategory } from '@/lib/program-localization';

export default function FeaturedPrograms() {
  const t = useTranslations('FeaturedPrograms');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && data && data.length > 0) {
        setPrograms(data);
      } else {
        // Fallback to static programsData if DB table is empty or error
        const fallback = programsData.slice(0, 3).map(p => ({
          id: p.id,
          title: p.title,
          description: p.overview,
          image_url: p.heroImage,
          category: p.badge.en
        }));
        setPrograms(fallback);
      }
    } catch {
      const fallback = programsData.slice(0, 3).map(p => ({
        id: p.id,
        title: p.title,
        description: p.overview,
        image_url: p.heroImage,
        category: p.badge.en
      }));
      setPrograms(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section 
      className={`w-full py-16 md:py-24 bg-[#FAF7F2] ${isAr ? 'font-arabic' : 'font-sans'}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#B8902E] font-bold tracking-[0.2em] text-[11px] uppercase">
              {t('tag')}
            </span>
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>

          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl text-[#0B2545]">
            {t('title')}
          </h2>

          <p className="max-w-[700px] text-gray-500 md:text-base font-sans mt-2 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* ================= CARDS GRID ================= */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {programs.map((prog, i) => {
              const titleEn = typeof prog.title === 'string' ? prog.title : prog.title?.en;
              const titleText = getLocalizedProgramText(prog.title, isAr, 'title');
              const descText = getLocalizedProgramText(prog.description, isAr, 'description', titleEn);
              const categoryText = getLocalizedCategory(prog.category, isAr);

              return (
                <motion.div
                  key={prog.id || i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group flex flex-col bg-white rounded-3xl border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
                >
                  {/* Image Section */}
                  <div className="w-full h-[220px] relative bg-gray-100 overflow-hidden">
                    {prog.image_url ? (
                      <img
                        src={prog.image_url}
                        alt={titleText}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <GraduationCap className="w-16 h-16 opacity-30" />
                      </div>
                    )}

                    {/* Category Tag on Image */}
                    {categoryText && (
                      <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} bg-[#0B2545]/85 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md border border-white/10 z-10`}>
                        {categoryText}
                      </div>
                    )}

                    {/* Floating Icon with White Border */}
                    <div className={`absolute -bottom-7 ${isAr ? 'right-6' : 'left-6'} w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center border-4 border-white shadow-md z-10`}>
                      <GraduationCap className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`p-8 pt-12 flex flex-col flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-xl font-serif font-bold mb-3 text-[#0B2545] leading-snug">
                      {titleText}
                    </h3>

                    <p className="text-[#6B7B8F] mb-8 text-[14px] leading-relaxed flex-1 line-clamp-3">
                      {descText}
                    </p>

                    <div className={`mt-auto ${isAr ? 'text-right' : 'text-left'}`}>
                      <Link
                        href={`/${locale}/programs/${prog.id}`}
                        className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0B2545] to-[#1A3A65] hover:from-[#133055] hover:to-[#0B2545] px-6 text-[13px] font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 w-max group"
                      >
                        {isAr ? 'استكشف البرنامج' : t('viewProgram')}
                        <ArrowRight className={`w-4 h-4 text-white transition-transform ${isAr ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                      </Link>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

        {/* ================= VIEW ALL BUTTON ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <Link 
            href={`/${locale}/programs`}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-transparent border-2 border-[#D4AF37] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-white font-bold text-sm md:text-base transition-all duration-300 hover:shadow-xl group"
          >
            {isAr ? 'استكشف جميع البرامج' : t('exploreAll')}
            <ArrowRight className={`w-5 h-5 transition-transform ${isAr ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}