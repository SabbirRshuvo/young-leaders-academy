import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FoundersNote() {
  const t = useTranslations('FoundersNote');

  return (
    <section className="w-full bg-[#0B2545] py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">

          {/* Left Column - Image Box */}
          <div className="lg:col-span-5 relative animate-fade-in-left">
            {/* Offset Gold Border Frame */}
            <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[#D4AF37]/40 rounded-2xl hidden sm:block"></div>

            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white aspect-[4/5] sm:aspect-square lg:aspect-[4/5] z-10">
              <Image
                src="/card1.png" // Placeholder, replace with actual founders image
                alt="Founders of Young Leaders Academy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column - Message Box */}
          <div className="lg:col-span-7 flex flex-col items-start text-left animate-fade-in-right">

            {/* Tagline */}
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
                {t('badge')}
              </span>
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37] lg:hidden"></div>
            </div>

            {/* Main Heading */}
            <h2 className="text-white font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mb-8">
              {t('title')}
            </h2>

            {/* Quote Icon */}
            <Quote className="w-10 h-10 md:w-12 md:h-12 text-[#D4AF37] mb-6 shrink-0 opacity-90" fill="currentColor" />

            {/* Quote Body */}
            <blockquote className="text-gray-200 text-base md:text-lg lg:text-xl leading-relaxed italic mb-10 font-medium">
              {t('quote')}
            </blockquote>

            {/* Sign-off */}
            <div className="flex flex-col items-start gap-4">
              <div className="w-12 h-[2px] bg-[#D4AF37]"></div>
              <div>
                <div className="text-white font-serif italic text-2xl md:text-3xl mb-1">
                  {t('signOffTitle')}
                </div>
                <div className="text-gray-400 text-[10px] md:text-xs tracking-widest uppercase font-bold">
                  {t('signOffSubtitle')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
