import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Landmark, GraduationCap, ArrowRight, ArrowLeft, HeartHandshake } from 'lucide-react';

export default async function PartnershipsPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const isAr = locale === 'ar';

  const t = await getTranslations('PartnershipsPage');

  const partnershipTypes = [
    {
      title: t('type1Title'),
      desc: t('type1Desc'),
      icon: Landmark,
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: t('type2Title'),
      desc: t('type2Desc'),
      icon: Building2,
      color: "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
    },
    {
      title: t('type3Title'),
      desc: t('type3Desc'),
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    }
  ];

  return (
    <div className={`w-full min-h-screen bg-white ${isAr ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      
      {/* Hero Section */}
      <section className="relative w-full bg-slate-900 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/features-program.png" 
            alt="Partnerships Background" 
            fill 
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col max-w-3xl items-start text-left">
            <div className="inline-flex px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6">
              {t('badge')}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10" dir="ltr">
              {t('subtitle')}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg"
            >
              {t('contactBtn')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="py-20 md:py-28 bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-left">
            <div className="flex flex-col order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-lg">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0B2545]">
                  {t('whyPartnerTitle')}
                </h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed" dir="ltr">
                {t('whyPartnerDesc')}
              </p>
            </div>
            
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <Image 
                src="/cambridge.png" // Placeholder
                alt="Partnership Collaboration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Types of Partnerships */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, idx) => (
              <div 
                key={idx} 
                className="flex flex-col p-8 md:p-10 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 items-start text-left"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${type.color}`}>
                  <type.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B2545] mb-4">
                  {type.title}
                </h3>
                <p className="text-gray-600 leading-relaxed" dir="ltr">
                  {type.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
