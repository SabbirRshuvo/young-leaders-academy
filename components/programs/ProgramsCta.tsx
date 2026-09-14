import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ProgramsCta() {
  return (
    <section className="relative w-full overflow-hidden flex items-center min-h-[450px] md:min-h-[500px]">

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
      <div className="absolute inset-0 "></div>

      {/* Content Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 md:py-24 relative z-20">

        <div className="max-w-xl flex flex-col justify-center animate-fade-in-left">

          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
              Your Future Starts Here
            </span>
          </div>

          <h2 className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Ready to Become a Leader?
          </h2>

          <p className="text-gray-200 text-base md:text-lg leading-relaxed mb-8 font-sans">
            Join a global community of ambitious young people and start your journey towards a brighter, more impactful future.
          </p>

          <div>
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-transform duration-300 hover:scale-105 group"
            >
              Explore Programs
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
