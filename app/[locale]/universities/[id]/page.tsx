import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { universitiesData } from '@/data/universities';
import { supabase } from '@/lib/supabase';
import { MapPin, Globe, Users, History, CheckCircle2, ArrowLeft } from 'lucide-react';
import UniversityDetailCta from '@/components/universities/UniversityDetailCta';

const nameTranslations: Record<string, string> = {
  'Oxford Innovation Institute': 'معهد أكسفورد للابتكار',
  'Silicon Valley Tech Academy': 'أكاديمية وادي السيليكون للتكنولوجيا',
  'Berlin Business School': 'كلية برلين للأعمال',
  'Global Leadership University': 'جامعة القيادة العالمية',
  'Melbourne Institute of Science': 'معهد ملبورن للعلوم',
};

const descTranslations: Record<string, string> = {
  'A leading institution dedicated to technological advancement and entrepreneurial research in the heart of the UK.':
    'مؤسسة رائدة مكرسة للتقدم التكنولوجي والبحوث الريادية في قلب المملكة المتحدة.',
  'Located in the global center of technological innovation, providing hands-on engineering and business curriculum.':
    'تقع في المركز العالمي للابتكار التكنولوجي، وتقدم مناهج هندسية وتجارية عملية.',
  'A top-tier business school focusing on European markets, finance, and global corporate leadership.':
    'كلية أعمال رائدة تركز على الأسواق الأوروبية والتمويل والقيادة المؤسسية العالمية.',
  'Preparing future diplomats and global policy makers through rigorous academic and practical training.':
    'إعداد الدبلوماسيين وصناع السياسات العالميين في المستقبل من خلال تدريب أكاديمي وعملي صارم.',
  'Pioneering research in data science, environmental engineering, and sustainable technologies.':
    'أبحاث رائدة في علوم البيانات والهندسة البيئية والتقنيات المستدامة.',
};

export default async function UniversityDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
}) {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;
  const isAr = locale === 'ar';

  let university: any = universitiesData.find((u) => u.id === id);

  if (!university) {
    const { data } = await supabase.from('universities').select('*').eq('id', id).single();
    if (data) {
      university = {
        id: data.id,
        name: data.name,
        name_ar: nameTranslations[data.name] || data.name,
        location: {
          en: data.city ? `${data.city}, ${data.country || 'Global'}` : data.country || 'Global',
          ar: data.city ? `${data.city}، ${data.country || 'عالمي'}` : data.country || 'عالمي',
        },
        logo: data.logo_url || '/placeholder-logo.png',
        heroImage: '/features-program.png',
        badge: {
          en: 'Partner University',
          ar: 'جامعة شريكة',
        },
        overview: {
          en: data.description || '',
          ar: descTranslations[data.description] || data.description || '',
        },
        stats: [
          { label: { en: 'Acceptance Rate', ar: 'معدل القبول' }, value: 'Competitive' },
          { label: { en: 'Global Rank', ar: 'التصنيف العالمي' }, value: 'Top 100' },
          { label: { en: 'International Students', ar: 'الطلاب الدوليين' }, value: '25%' },
          { label: { en: 'Founded', ar: 'تأسست' }, value: '20th Century' },
        ],
        requirements: [
          {
            en: 'Academic Excellence (High GPA and rigorous coursework)',
            ar: 'التميز الأكاديمي (معدل تراكمي مرتفع ودورات دراسية صارمة)',
          },
          {
            en: 'English Language Proficiency (IELTS/TOEFL)',
            ar: 'إتقان اللغة الإنجليزية (IELTS/TOEFL)',
          },
          {
            en: 'Strong Letters of Recommendation',
            ar: 'خطابات توصية قوية',
          },
        ],
        programs: [
          { en: 'Global Leadership & Policy', ar: 'القيادة والسياسة العالمية' },
          { en: 'Advanced Technology & Innovation', ar: 'التكنولوجيا المتقدمة والابتكار' },
          { en: 'International Business', ar: 'إدارة الأعمال الدولية' },
        ],
      };
    }
  }

  if (!university) {
    notFound();
  }

  // Translation helpers
  const l = (item: { en: string; ar: string }) => (isAr ? item.ar : item.en);

  const displayName = isAr ? university.name_ar || university.name : university.name;
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
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0B2545] font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backText}</span>
        </Link>
      </div>

      {/* Hero Section - Always left aligned */}
      <section className="relative w-full overflow-hidden mb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-gray-200">
            <Image
              src={university.heroImage}
              alt={displayName}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col text-left items-start">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-[#D4AF37]/90 text-white text-xs md:text-sm font-bold uppercase tracking-wider mb-6 shadow-md">
                {l(university.badge)}
              </div>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-2 md:p-4 flex items-center justify-center shadow-lg shrink-0">
                  <Image
                    src={university.logo}
                    alt={`${displayName} logo`}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col text-left items-start">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-200 text-base md:text-lg font-medium">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    <span>{l(university.location)}</span>
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
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{overviewTitle}</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed text-left">
                {l(university.overview)}
              </p>
            </div>

            {/* Academic Programs */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{programsTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {university.programs.map((prog: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B2545]/5 flex items-center justify-center shrink-0 text-[#D4AF37]">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 text-base font-semibold text-left">{l(prog)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admission Requirements */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md border border-gray-300 flex flex-col text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0B2545] mb-6">{requirementsTitle}</h2>
              <div className="flex flex-col gap-4">
                {university.requirements.map((req: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 text-left">
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-base md:text-lg text-left">{l(req)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Sidebar) */}
          <div className="lg:col-span-1 lg:sticky lg:top-28 flex flex-col space-y-6">
            {/* Quick Stats */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-300 flex flex-col text-left items-start">
              <h3 className="text-2xl font-bold text-[#0B2545] mb-6 pb-6 border-b border-gray-100 w-full text-left">
                {statsTitle}
              </h3>

              <div className="flex flex-col gap-6 w-full">
                {university.stats.map((stat: any, idx: number) => {
                  return (
                    <div key={idx} className="flex items-center gap-4 w-full text-left">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 border border-gray-100 text-[#D4AF37] shrink-0">
                        {idx === 0 ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : idx === 1 ? (
                          <Globe className="w-5 h-5" />
                        ) : idx === 2 ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          <History className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 items-start text-left">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                          {l(stat.label)}
                        </span>
                        <span className="text-base font-bold text-[#0B2545] text-left">{stat.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <UniversityDetailCta
              universityId={university.id}
              universityName={displayName}
              locale={locale}
              isAr={isAr}
              applyNowText={applyNowText}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
