import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutHero() {
  const t = useTranslations('AboutHero');
  
  return (
    <section className="relative w-full min-h-[50vh] md:min-h-[60vh] flex items-center bg-[url('/about-banner.png')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Overlay - Solid dark tint on mobile, gradient on desktop */}
      <div className="absolute inset-0 bg-[#0B2545]/80 md:bg-transparent md:bg-gradient-to-r rtl:md:bg-gradient-to-l md:from-[#0B2545]/95 md:from-40% md:to-transparent md:to-80%" />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-12 max-w-[1440px]">
        <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start text-left">

          {/* Tagline */}
          <div className="flex items-center gap-4 mb-4 md:mb-6 animate-fade-in-up">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('badge')}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37] lg:hidden"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-bold leading-tight md:leading-snug mb-6 md:mb-8 animate-fade-in-up-delay-1">
            {t('title1')}<br className="hidden md:block" />
            {t('title2')}
          </h1>

          {/* Description Paragraph */}
          <p className="text-gray-200 text-base md:text-lg lg:text-[19px] leading-relaxed mb-8 md:mb-10 max-w-xl lg:max-w-2xl font-sans animate-fade-in-up-delay-2">
            {t('subtitle')}
          </p>

          {/* Call to Action Button */}
          <Link
            href="#our-journey"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg animate-fade-in-up-delay-3"
          >
            {t('cta')}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
