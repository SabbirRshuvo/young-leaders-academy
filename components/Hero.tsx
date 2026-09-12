import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] xl:h-[800px] flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/banner.png')` }}
      >
        <div className="absolute inset-0  md:bg-gradient-to-r md:from-white/10 md:to-transparent"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-start space-y-6 max-w-2xl bg-white/80 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none">
          <div className="w-16 h-1 bg-gold mb-2"></div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-navy leading-[1.1]">
            Preparing Young<br />People For Life.
          </h1>
          <p className="text-navy font-bold text-lg md:text-xl max-w-[500px]">
            One Academy. One Journey.<br />A Lifetime of Impact.
          </p>
          <div className="pt-4">
            <Link
              href="/programs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-8 text-base font-bold text-white shadow-lg transition-all hover:bg-gold/90 hover:scale-105"
            >
              Explore Programs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}