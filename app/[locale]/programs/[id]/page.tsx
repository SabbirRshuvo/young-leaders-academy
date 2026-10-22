import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, Users, MonitorPlay, Banknote, ArrowRight, Lock, PlayCircle } from 'lucide-react';
import EnrollNowButton from '@/components/programs/EnrollNowButton';
import {
  getLocalizedProgramText,
  getLocalizedCategory,
  getLocalizedSpecValue,
  getLocalizedModuleText
} from '@/lib/program-localization';

export default async function ProgramDetailsPage({
  params
}: {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string }
}) {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;

  const isAr = locale === 'ar';
  const t = await getTranslations('ProgramDetails');
  const tEnroll = await getTranslations('HowToEnroll');

  // Fetch program from Supabase
  const { data: program, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !program) {
    notFound();
  }

  // Fetch modules for this program
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('program_id', id)
    .order('order_index', { ascending: true });

  // Fetch other programs
  const { data: otherPrograms } = await supabase
    .from('programs')
    .select('*')
    .neq('id', id)
    .limit(3);

  // Check enrollment status (Handles SSR cleanly)
  let isEnrolled = false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('program_id', id)
        .single();
        
      if (enrollment) isEnrolled = true;
    }
  } catch (err) {
    console.log("Auth check error (expected if no cookies exist):", err);
  }

  // Localize dynamic database fields
  const localizedTitle = getLocalizedProgramText(program.title, isAr, 'title', program.title);
  const localizedDescription = getLocalizedProgramText(program.description, isAr, 'description', program.title);
  const localizedCategory = getLocalizedCategory(program.category, isAr);
  const localizedAgeGroup = getLocalizedSpecValue(program.age_group, isAr, t('allAges'));
  const localizedDuration = getLocalizedSpecValue(program.duration, isAr, t('flexible'));
  const localizedMode = getLocalizedSpecValue(program.mode, isAr, t('online'));
  const localizedStartDate = getLocalizedSpecValue(program.start_date, isAr, t('selfPaced'));

  const specs = [
    { icon: Users, label: t('ageGroup'), value: localizedAgeGroup },
    { icon: Clock, label: t('duration'), value: localizedDuration },
    { icon: MonitorPlay, label: t('mode'), value: localizedMode },
    { icon: Calendar, label: t('startDate'), value: localizedStartDate },
    { icon: Banknote, label: t('fee'), value: program.price ? `$${program.price}` : t('free') },
  ];

  return (
    <div dir="ltr" className={`w-full min-h-screen bg-gray-50 ${isAr ? 'font-arabic' : 'font-sans'}`}>
      {/* Hero Section */}
      <section className="relative w-full bg-slate-900 text-white overflow-hidden py-10 sm:py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col space-y-4 sm:space-y-6 w-full">
              <div className="inline-flex w-max px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs md:text-sm font-bold uppercase tracking-wider">
                {localizedCategory}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white break-words">
                {localizedTitle}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
                {localizedDescription}
              </p>
            </div>

            <div className="relative w-full h-[240px] sm:h-[340px] md:h-[400px] lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 flex items-center justify-center shrink-0">
              {program.image_url ? (
                <img
                    src={program.image_url}
                    alt={localizedTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <span className="text-slate-500 font-bold">{t('noCoverImage')}</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-10 sm:py-16 md:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:col-span-2 flex flex-col space-y-8 sm:space-y-12">
            
            {/* Program Overview */}
            <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-md border border-gray-300">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B2545] mb-4 sm:mb-6">{t('overview')}</h2>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {localizedDescription}
              </p>
            </div>

            {/* Curriculum / Modules (WITH LOCKING LOGIC) */}
            <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-md border border-gray-300">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-4">
                 <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B2545]">{t('curriculum')}</h2>
                 {!isEnrolled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full border border-red-100">
                      <Lock className="w-3.5 h-3.5" /> {t('locked')}
                    </span>
                 )}
              </div>
              
              <div className="flex flex-col gap-3 sm:gap-4">
                {modules && modules.length > 0 ? (
                  modules.map((mod, index) => {
                    const modTitle = getLocalizedModuleText(mod.title, isAr, 'title');
                    const modDesc = getLocalizedModuleText(mod.description, isAr, 'description');
                    return (
                      <div key={mod.id} className={`flex items-center justify-between gap-3 p-3.5 sm:p-5 rounded-xl border ${isEnrolled ? 'bg-gray-50 border-gray-200 hover:border-[#D4AF37] transition-colors' : 'bg-gray-50/50 border-gray-100 opacity-75'}`}>
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-white border border-gray-200 text-[#0B2545] font-bold text-xs sm:text-sm">
                            {index + 1}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm sm:text-lg font-bold text-[#0B2545] truncate">{modTitle}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{modDesc}</p>
                          </div>
                        </div>
                        
                        {isEnrolled ? (
                          <Link
                            href={`/${locale}/programs/${program.id}/play?module=${mod.id}`}
                            aria-label={t('viewCourse')}
                            title={t('viewCourse')}
                            className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0B2545] text-white hover:bg-[#D4AF37] transition-colors"
                          >
                            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Link>
                        ) : (
                          <div
                            aria-label={t('locked')}
                            title={t('locked')}
                            className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 text-gray-400"
                          >
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic text-sm sm:text-base">{t('noModules')}</p>
                )}
              </div>
              
              {!isEnrolled && (
                <div className="mt-8 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2545] mb-2">{t('enrollToUnlock')}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 max-w-md mx-auto">{t('enrollToUnlockDesc')}</p>
                  <Link
                    href={`/${locale}/apply?program=${program.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#c5a132] text-white font-bold text-sm sm:text-base transition-colors"
                  >
                    {t('applyNowToAccess')}
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="w-full lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-gray-300 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B2545] mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-100">
                {t('programSpecs')}
              </h3>

              <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-gray-50 border border-gray-100 text-[#D4AF37]">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{spec.label}</span>
                        <span className="text-sm sm:text-base font-bold text-[#0B2545] truncate">{spec.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <EnrollNowButton
                  program={{
                    id: program.id,
                    title: localizedTitle,
                    price: program.price ? Number(program.price) : 1500,
                    category: localizedCategory,
                    duration: localizedDuration,
                  }}
                  isEnrolled={isEnrolled}
                  locale={locale}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How to Enroll Section */}
      <section className="w-full py-12 sm:py-16 md:py-24 bg-white border-y border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {tEnroll('badge')}
              </span>
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B2545] mb-3 sm:mb-4">
              {tEnroll('title')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
              {tEnroll('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative flex flex-col items-center text-center p-5 sm:p-6 bg-gray-50 rounded-2xl border border-gray-300 shadow-sm group hover:shadow-md transition-shadow">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#0B2545] mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0B2545] mb-2 sm:mb-3">
                  {tEnroll(`step${step}Title`)}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                  {tEnroll(`step${step}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Programs */}
      {otherPrograms && otherPrograms.length > 0 && (
        <section className="w-full py-12 sm:py-16 md:py-24 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0B2545] mb-8 sm:mb-12 text-center">
              {t('relatedPrograms')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {otherPrograms.map((p) => {
                const pTitle = getLocalizedProgramText(p.title, isAr, 'title', p.title);
                const pCategory = getLocalizedCategory(p.category, isAr);
                const pDuration = getLocalizedSpecValue(p.duration, isAr, t('defaultDuration'));
                return (
                  <div key={p.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative w-full h-[180px] sm:h-[220px] bg-gray-100 overflow-hidden shrink-0">
                      {p.image_url ? (
                          <img 
                              src={p.image_url} 
                              alt={pTitle} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                      ) : (
                          <div className="absolute inset-0 bg-gray-200"></div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-[#D4AF37] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                        {pCategory}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5 sm:p-6 md:p-8">
                      <h3 className="text-[#0B2545] font-bold text-lg sm:text-xl mb-3 line-clamp-2">
                        {pTitle}
                      </h3>
                      <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-y border-gray-100 mt-auto mb-5 sm:mb-6 text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t('duration')}</span>
                          <span className="text-[#0B2545] font-bold">{pDuration}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-200"></div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t('fee')}</span>
                          <span className="text-[#0B2545] font-bold">{p.price ? `$${p.price}` : t('free')}</span>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/programs/${p.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-max px-6 py-2.5 rounded-full bg-[#0B2545] hover:bg-[#071931] text-white font-semibold text-sm transition-colors group/btn"
                      >
                        {t('viewProgram')}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
