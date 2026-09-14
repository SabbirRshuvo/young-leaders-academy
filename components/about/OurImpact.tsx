import { GraduationCap, Landmark, Globe, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function OurImpact() {
  const t = useTranslations('OurImpact');
  
  const stats = [
    {
      icon: <GraduationCap className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />,
      number: t('stat1Num'),
      label: t('stat1Label'),
      description: t('stat1Desc'),
      delayClass: "animate-fade-in-up-delay-1"
    },
    {
      icon: <Landmark className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />,
      number: t('stat2Num'),
      label: t('stat2Label'),
      description: t('stat2Desc'),
      delayClass: "animate-fade-in-up-delay-2"
    },
    {
      icon: <Globe className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />,
      number: t('stat3Num'),
      label: t('stat3Label'),
      description: t('stat3Desc'),
      delayClass: "animate-fade-in-up-delay-3"
    },
    {
      icon: <Users className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />,
      number: t('stat4Num'),
      label: t('stat4Label'),
      description: t('stat4Desc'),
      delayClass: "animate-fade-in-up-delay-4"
    }
  ];

  return (
    <section className="w-full bg-[#FCFAF6] py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">
        
        {/* Header Content */}
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('badge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          
          <h2 className="text-[#0B2545] font-serif text-3xl md:text-4xl font-bold mt-2 mb-3">
            {t('title')}
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-[17px] leading-relaxed font-sans">
            {t('subtitle')}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12 max-w-7xl mx-auto">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`group bg-white rounded-[24px] p-8 text-center border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col items-center ${stat.delayClass}`}
            >
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mb-6 shrink-0">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#0B2545] mt-4 mb-1">
                {stat.number}
              </div>
              <div className="text-base md:text-lg font-bold text-[#0B2545] mb-2 font-serif">
                {stat.label}
              </div>
              <p className="text-sm text-gray-600 font-sans">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
