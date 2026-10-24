import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ProgramsCta() {
  const t = useTranslations('ProgramsCta');

  return (
    <section className="relative w-full overflow-hidden flex items-center min-h-[400px] md:min-h-[460px]">

      {/* Background Image */}
      <Image
        src="/program-cta.png"
        alt="Hikers on a mountain summit"
        fill
        sizes="100vw"
        className="object-cover object-right"
        quality={75}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75"></div>

      {/* Content Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 md:py-24 relative z-20">

        <div className="max-w-xl flex flex-col justify-center animate-fade-in-left">

          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              {t('badge')}
            </span>
          </div>

          <h2 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            {t('title')}
          </h2>

          <p className="text-gray-200 text-base md:text-lg leading-relaxed font-sans">
            {t('subtitle')}
          </p>

        </div>
      </div>
    </section>
  );
}
