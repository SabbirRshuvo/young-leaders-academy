import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Clock, Calendar, Users, MonitorPlay, Banknote, ArrowRight, Download, BookOpen, Loader2 } from 'lucide-react';

export default async function ProgramDetailsPage({
  params
}: {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string }
}) {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;

  const isAr = locale === 'ar';
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

  // Fetch other programs
  const { data: otherPrograms } = await supabase
    .from('programs')
    .select('*')
    .neq('id', id)
    .limit(3);

  // Translation/Text fallbacks (In a real app, you might have JSON i18n columns, but we fallback gracefully here)
  const applyNowText = isAr ? 'قدم الآن' : 'Apply Now';
  const downloadBrochureText = isAr ? 'تحميل الكتيب' : 'Download Brochure';
  const overviewTitle = isAr ? 'نظرة عامة على البرنامج' : 'Program Overview';
  const programSpecsTitle = isAr ? 'مواصفات البرنامج' : 'Program Specs';
  const relatedProgramsTitle = isAr ? 'برامج ذات صلة' : 'Related Programs';
  const viewProgramText = isAr ? 'عرض البرنامج' : 'View Program';

  const specs = [
    { icon: Users, label: isAr ? 'الفئة العمرية' : 'Age Group', value: program.age_group || 'All Ages' },
    { icon: Clock, label: isAr ? 'المدة' : 'Duration', value: program.duration || 'Flexible' },
    { icon: MonitorPlay, label: isAr ? 'النظام' : 'Mode', value: program.mode || 'Online' },
    { icon: Calendar, label: isAr ? 'تاريخ البدء' : 'Start Date', value: program.start_date || 'Self-paced' },
    { icon: Banknote, label: isAr ? 'الرسوم' : 'Fee', value: program.price ? `$${program.price}` : 'Free' },
  ];

  return (
    <div dir="ltr" className={`w-full min-h-screen bg-gray-50 ${isAr ? 'font-arabic' : 'font-sans'}`}>
      {/* Hero Section */}
      <section className="relative w-full bg-slate-900 text-white overflow-hidden py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="flex flex-col space-y-6">
              <div className="inline-flex w-max px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs md:text-sm font-bold uppercase tracking-wider">
                {program.category || "General"}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                {program.title}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl">
                {program.description}
              </p>
            </div>

            {/* Right Hero Image */}
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 flex items-center justify-center">
              {program.cover_image_url ? (
                <Image
                    src={program.cover_image_url}
                    alt={program.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <span className="text-slate-500 font-bold">No Cover Image</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 md:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 flex flex-col space-y-12">

            {/* Program Overview */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-gray-300">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{overviewTitle}</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {program.description}
              </p>
            </div>

            {/* Link to Play View */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-[#D4AF37]/50 bg-gradient-to-br from-white to-amber-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#0B2545] mb-2">Are you already enrolled?</h2>
                        <p className="text-gray-600">Access the full curriculum, watch videos, download PDFs, and track your progress in the live student course player.</p>
                    </div>
                    <Link
                        href={`/${locale}/programs/${program.id}/play`}
                        className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] hover:bg-[#071931] text-white font-bold transition-transform hover:scale-[1.02] shadow-md"
                    >
                        Enter Course Player
                        <MonitorPlay className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>

          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-300 flex flex-col">
              <h3 className="text-2xl font-bold text-[#0B2545] mb-6 pb-6 border-b border-gray-100">
                {programSpecsTitle}
              </h3>

              <div className="flex flex-col gap-6 mb-8">
                {specs.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-[#D4AF37]">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{spec.label}</span>
                        <span className="text-base font-bold text-[#0B2545]">{spec.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <Link
                  href={`/${locale}/apply?program=${program.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group"
                >
                  {applyNowText}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How to Enroll Section */}
      <section className="w-full py-16 md:py-24 bg-white border-y border-gray-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {tEnroll('badge')}
              </span>
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B2545] mb-4">
              {tEnroll('title')}
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl">
              {tEnroll('subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-300 shadow-sm group hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#0B2545] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {step}
                </div>
                <h3 className="text-xl font-bold text-[#0B2545] mb-3">
                  {tEnroll(`step${step}Title`)}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  {tEnroll(`step${step}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Programs */}
      {otherPrograms && otherPrograms.length > 0 && (
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B2545] mb-12 text-center">
              {relatedProgramsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPrograms.map((p) => (
                <div key={p.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-full h-[220px] bg-gray-100">
                    {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="absolute bottom-4 left-4 bg-[#D4AF37] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
                      {p.category || "General"}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-6 md:p-8">
                    <h3 className="text-[#0B2545] font-bold text-xl mb-3 line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-4 py-4 border-y border-gray-100 mt-auto mb-6 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isAr ? 'المدة' : 'Duration'}</span>
                        <span className="text-[#0B2545] font-bold">{p.duration || "4 Weeks"}</span>
                      </div>
                      <div className="w-[1px] h-8 bg-gray-200"></div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{isAr ? 'الرسوم' : 'Fee'}</span>
                        <span className="text-[#0B2545] font-bold">{p.price ? `$${p.price}` : "Free"}</span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/programs/${p.id}`}
                      className="inline-flex items-center justify-center gap-2 w-max px-6 py-2.5 rounded-full bg-[#0B2545] hover:bg-[#071931] text-white font-semibold text-sm transition-colors group/btn"
                    >
                      {viewProgramText}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
