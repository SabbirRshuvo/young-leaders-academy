import Link from 'next/link';
import { GraduationCap, Users, Lightbulb, ArrowRight } from 'lucide-react';

const programs = [
  {
    title: 'Academic Excellence',
    desc: 'Build a strong academic foundation with expert guidance, personalized support and real-world learning.',
    icon: GraduationCap,
    image: '/card1.png',
  },
  {
    title: 'Leadership Development',
    desc: 'Develop confidence, communication and decision-making skills to become effective and compassionate leaders.',
    icon: Users,
    image: '/card2.png',
  },
  {
    title: 'Innovation',
    desc: 'Explore creativity, technology and problem-solving to turn ideas into real-world solutions.',
    icon: Lightbulb,
    image: '/card3.png',
  }
];

export default function FeaturedPrograms() {
  return (
    <section className="w-full py-16 md:py-24 bg-[#CFD9E5]">
      <div className="container mx-auto px-4 md:px-6 max-w-[1440px]">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#B8902E] font-bold tracking-[0.2em] text-[11px] uppercase">
              FEATURED PROGRAMS
            </span>
            <div className="h-[1px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>

          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl md:text-5xl text-[#0B2545]">
            Build Skills. Create Opportunities.
          </h2>

          <p className="max-w-[700px] text-gray-500 md:text-base font-sans mt-2">
            Our specialized programs are designed to develop future-ready leaders.
          </p>
        </div>

        {/* ================= CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <div
                key={i}
                className="flex flex-col bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300"
              >
                {/* Image Section */}
                <div className="w-full h-[220px] relative">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Floating Icon with White Border */}
                  <div className="absolute -bottom-7 left-6 w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 pt-12 flex flex-col flex-1">
                  <h3 className="text-xl font-serif font-bold mb-3 text-[#0B2545]">
                    {prog.title}
                  </h3>

                  <p className="text-[#6B7B8F] mb-8 text-[14px] leading-relaxed flex-1">
                    {prog.desc}
                  </p>

                  <div className="mt-auto">
                    <Link
                      href={`/programs`}
                      className="inline-flex h-[42px] items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-[13px] font-semibold text-white hover:bg-[#0B2545]/90 transition-colors w-max"
                    >
                      Enroll Now
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}