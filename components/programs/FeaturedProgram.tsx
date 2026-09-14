import Image from 'next/image';
import { Calendar, Users, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedProgram() {
  return (
    <section className="w-full bg-[#FCFAF6] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        <div className="bg-white rounded-[32px] p-6 sm:p-10 lg:p-12 border border-[#D4AF37]/30 shadow-xl shadow-black/[0.04] animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left Content */}
            <div className="flex flex-col items-start order-2 lg:order-1">

              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                Featured Program
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-[#0B2545] leading-tight mb-6">
                Global Young Leaders Fellowship
              </h2>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                A transformative program that brings together outstanding young minds from around the world to develop leadership skills, build global networks and create real-world impact.
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-6 md:gap-10 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FCFAF6] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Duration</div>
                    <div className="text-sm font-bold text-[#0B2545]">2 Weeks</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FCFAF6] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Age Group</div>
                    <div className="text-sm font-bold text-[#0B2545]">16 – 22</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FCFAF6] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Format</div>
                    <div className="text-sm font-bold text-[#0B2545]">In-Person + Online</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/programs/global-fellowship"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-transform duration-300 hover:scale-105 group"
              >
                Learn More
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Right Image */}
            <div className="w-full relative h-[300px] sm:h-[400px] lg:h-[450px] order-1 lg:order-2">
              <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white shadow-xl group hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/features-program.png"
                  alt="Global Young Leaders Fellowship"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
