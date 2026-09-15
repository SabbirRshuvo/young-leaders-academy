import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { universitiesData } from '@/data/universities';
import { MapPin, Globe, Users, History, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default async function UniversityDetailsPage({
  params
}: {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string }
}) {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;
  const isAr = locale === 'ar';

  const university = universitiesData.find(u => u.id === id);
  if (!university) {
    notFound();
  }

  // Translation helpers
  const l = (item: { en: string; ar: string }) => isAr ? item.ar : item.en;
  const lArr = (item: { en: string[]; ar: string[] }) => isAr ? item.ar : item.en;

  const backText = isAr ? 'العودة للجامعات' : 'Back to Universities';
  const overviewTitle = isAr ? 'نظرة عامة على الجامعة' : 'University Overview';
  const requirementsTitle = isAr ? 'متطلبات القبول' : 'Admission Requirements';
  const programsTitle = isAr ? 'البرامج الأكاديمية' : 'Academic Programs';
  const applyNowText = isAr ? 'قدم الآن' : 'Apply Now';
  const statsTitle = isAr ? 'إحصائيات سريعة' : 'Quick Stats';

  return (
    <div dir="ltr" className={`w-full min-h-screen bg-gray-50 ${isAr ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Back Button */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-4">
        <Link
          href={`/${locale}/universities`}
          className={`inline-flex items-center gap-2 text-gray-500 hover:text-[#0B2545] font-medium transition-colors ${isAr ? 'flex-row-reverse' : ''}`}
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{backText}</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden mb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-gray-200">
            <Image
              src={university.heroImage}
              alt={university.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
            
            <div className={`absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col ${isAr ? 'text-right items-end' : 'text-left items-start'}`}>
              <div className="inline-flex px-4 py-1.5 rounded-full bg-[#D4AF37]/90 text-white text-xs md:text-sm font-bold uppercase tracking-wider mb-6 shadow-md">
                {l(university.badge)}
              </div>
              <div className={`flex items-center gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-2 md:p-4 flex items-center justify-center shadow-lg shrink-0">
                  <Image 
                    src={university.logo} 
                    alt={`${university.name} logo`} 
                    width={80} 
                    height={80} 
                    className="object-contain"
                  />
                </div>
                <div className={`flex flex-col ${isAr ? 'items-end' : 'items-start'}`}>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {university.name}
                  </h1>
                  <div className={`flex items-center gap-2 text-gray-200 text-base md:text-lg font-medium ${isAr ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    {l(university.location)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 flex flex-col space-y-12">

            {/* University Overview */}
            <div className={`bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col ${isAr ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{overviewTitle}</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed" dir={isAr ? "rtl" : "ltr"}>
                {l(university.overview)}
              </p>
            </div>

            {/* Academic Programs */}
            <div className={`bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col ${isAr ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{programsTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {university.programs.map((prog, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#0B2545]/5 flex items-center justify-center shrink-0 text-[#D4AF37]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 text-base font-semibold" dir={isAr ? "rtl" : "ltr"}>{l(prog)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Requirements */}
            <div className={`bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col ${isAr ? 'text-right' : 'text-left'}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{requirementsTitle}</h2>
              <div className="flex flex-col gap-4">
                {university.requirements.map((req, idx) => (
                  <div key={idx} className={`flex items-start gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-base md:text-lg" dir={isAr ? "rtl" : "ltr"}>{l(req)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 flex flex-col space-y-6">
            
            {/* Quick Stats */}
            <div className={`bg-white p-8 rounded-3xl shadow-md border border-gray-300 flex flex-col ${isAr ? 'text-right items-end' : 'text-left items-start'}`}>
              <h3 className="text-2xl font-bold text-[#0B2545] mb-6 pb-6 border-b border-gray-100 w-full">
                {statsTitle}
              </h3>

              <div className="flex flex-col gap-6 w-full">
                {university.stats.map((stat, idx) => {
                  return (
                    <div key={idx} className={`flex items-center gap-4 w-full ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-[#D4AF37] shrink-0">
                        {idx === 0 ? <CheckCircle2 className="w-5 h-5" /> : 
                         idx === 1 ? <Globe className="w-5 h-5" /> : 
                         idx === 2 ? <Users className="w-5 h-5" /> : 
                         <History className="w-5 h-5" />}
                      </div>
                      <div className={`flex flex-col flex-1 ${isAr ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{l(stat.label)}</span>
                        <span className="text-base font-bold text-[#0B2545]">{stat.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#0B2545] p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <h3 className={`text-2xl font-bold text-white mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
                {isAr ? 'هل أنت مستعد للتقديم؟' : 'Ready to Apply?'}
              </h3>
              <p className={`text-gray-300 text-sm mb-8 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
                {isAr 
                  ? 'ابدأ طلبك اليوم وانضم إلى نخبة الطلاب في شبكتنا الأكاديمية العالمية.' 
                  : 'Start your application today and join elite students in our global academic network.'}
              </p>

              <Link
                href={`/${locale}/apply?university=${university.id}`}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group ${isAr ? 'flex-row-reverse' : ''}`}
              >
                {applyNowText}
                {isAr ? (
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
