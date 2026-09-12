'use client';

import {
  UserRound,
  Brain,
  BriefcaseBusiness,
  HeartPulse,
  Globe2,
  UsersRound,
  Flag,
} from 'lucide-react';

const pillars = [
  {
    name: 'SELF',
    icon: UserRound,
    points: ['Identity', 'Values', 'Confidence', 'Purpose', 'Discipline'],
  },
  {
    name: 'MIND',
    icon: Brain,
    points: ['Critical Thinking', 'AI & Technology', 'Innovation', 'Problem Solving', 'Creativity'],
  },
  {
    name: 'LEADERSHIP',
    icon: Flag,
    points: ['Leadership', 'Communication', 'Influence', 'Public Speaking', 'Teamwork'],
  },
  {
    name: 'CAREER',
    icon: BriefcaseBusiness,
    points: ['University Guidance', 'Career Planning', 'Entrepreneurship', 'Internships', 'Financial Literacy'],
  },
  {
    name: 'HEALTH',
    icon: HeartPulse,
    points: ['Sports & Fitness', 'Nutrition', 'Mental Wellbeing', 'Sleep & Recovery', 'Healthy Habits'],
  },
  {
    name: 'SOCIETY',
    icon: Globe2,
    points: ['Ethics & Integrity', 'Community Service', 'Social Intelligence', 'Patriotism', 'Global Awareness'],
  },
  {
    name: 'FAMILY',
    icon: UsersRound,
    points: ['Parent Coaching', 'Teen Coaching', 'Parenting Skills', 'Family Communication', 'Stronger Relationships'],
  },
];

export default function Pillars() {
  return (
    <section className="relative w-full bg-[#CFD9E5] py-20 md:py-28 overflow-hidden font-sans">

      {/* ================= BACKGROUND DECORATIVE RINGS ================= */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[15%] w-[60vw] h-[60vw] rounded-full border-[1.5px] border-[#D4AF37]/15" />
        <div className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full border-[1.5px] border-[#D4AF37]/15" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8 z-10">

        {/* ================= HEADER ================= */}
        <div className="mb-16 flex flex-col items-center text-center relative z-10">
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-[1px] w-[40px] bg-[#D4AF37]" />
            <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-[#B8902E]">
              The 7 Pillars
            </span>
            <span className="h-[1px] w-[40px] bg-[#D4AF37]" />
          </div>

          <h2 className="m-0 max-w-[800px] font-serif text-[36px] sm:text-[46px] md:text-[56px] leading-[1.1] tracking-tight text-[#0B2545] mb-5">
            <span className="font-bold">Holistic Development</span> <br className="hidden md:block" />
            <span className="font-normal italic text-[#0B2545]/90">for a Brighter</span>{' '}
            <span className="font-bold">Future</span>
          </h2>

          <p className="mt-2 max-w-[650px] text-[14px] md:text-[16px] leading-relaxed text-[#6B7B8F]">
            We nurture every aspect of a young person&apos;s growth, helping them build
            the skills, character and confidence to lead a meaningful life.
          </p>
        </div>

        {/* ================= STATIC GRID (4 Top, 3 Bottom) ================= */}
        {/* flex-wrap and justify-center will naturally force 4 items on top and 3 centered on the bottom on large screens */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-[1280px] mx-auto">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.name}
                className="group relative h-[520px] w-full sm:w-[320px] lg:w-[280px] xl:w-[295px] bg-white rounded-[28px] shadow-[0_8px_30px_rgba(11,37,69,0.06)] overflow-hidden flex flex-col items-center pt-10 px-6 sm:px-8 border border-gray-200 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/40"
              >

                {/* Glowing background behind the icon */}
                <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[120px] h-[120px] bg-[radial-gradient(circle,rgba(212,175,55,0.25)_0%,rgba(255,255,255,0)_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                {/* Icon Ring */}
                <div className="relative flex items-center justify-center w-[75px] h-[75px] rounded-full border-[1.5px] border-[#D4AF37] bg-white shadow-sm mb-5 group-hover:bg-[#FCFAF6] transition-colors">
                  <Icon className="w-[30px] h-[30px] text-[#0B2545]" strokeWidth={1.5} />
                </div>

                {/* Title & Golden Divider */}
                <h3 className="text-[#0B2545] font-bold text-[18px] uppercase tracking-[0.15em]">{pillar.name}</h3>
                <div className="w-[35px] h-[1.5px] bg-[#D4AF37] mt-3 mb-6 group-hover:w-[50px] transition-all duration-300" />

                {/* Bullet Points */}
                <ul className="w-full space-y-3.5 z-10 relative">
                  {pillar.points.map(point => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#D4AF37] mt-[9px] shrink-0" />
                      <span className="text-[#0B2545]/85 text-[18px] font-medium leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>

                {/* ================= EXACT BOTTOM ABSTRACT LAYERS ================= */}
                <div className="absolute bottom-0 left-0 w-full h-[150px] pointer-events-none">
                  <svg viewBox="0 0 320 150" preserveAspectRatio="none" className="w-full h-full">

                    {/* Layer 1 (Back Faded Mountain) */}
                    <path d="M0,110 L40,80 L90,100 L150,60 L210,105 L260,75 L320,110 L320,150 L0,150 Z" fill="#E8ECEF" opacity="0.6" />

                    {/* Layer 2 (Middle Grey/Navy Mountain) */}
                    <path d="M0,130 L60,95 L120,120 L180,85 L250,125 L320,100 L320,150 L0,150 Z" fill="#D3DCE3" opacity="0.7" />

                    {/* Layer 3 (Front Deep Navy Upward Curve) */}
                    <path d="M0,145 Q160,85 320,145 L320,150 L0,150 Z" fill="#0B2545" />

                    {/* Gold Border on Front Curve */}
                    <path d="M0,145 Q160,85 320,145" fill="none" stroke="#D4AF37" strokeWidth="2.5" />

                    {/* Center Decor: — ✦ — */}
                    <line x1="130" y1="125" x2="145" y2="125" stroke="#D4AF37" strokeWidth="1.5" />
                    <path d="M160,118 L162.5,124 L168,125 L162.5,126 L160,132 L157.5,126 L152,125 L157.5,124 Z" fill="#D4AF37" />
                    <line x1="175" y1="125" x2="190" y2="125" stroke="#D4AF37" strokeWidth="1.5" />

                  </svg>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}