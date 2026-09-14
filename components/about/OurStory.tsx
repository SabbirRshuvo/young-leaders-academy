import { Users, Binoculars, Gem } from 'lucide-react';

export default function OurStory() {
  const values = [
    "Integrity",
    "Excellence",
    "Compassion",
    "Collaboration",
    "Global Mindset"
  ];

  return (
    <section className="w-full bg-[#FCFAF6] py-16 md:py-24 overflow-hidden" id="our-journey">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* Left Column - Text Content */}
          <div className="lg:col-span-5 flex flex-col items-start animate-fade-in-left">
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
                Our Story
              </span>
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37] lg:hidden"></div>
            </div>

            <h2 className="text-[#0B2545] font-serif text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mb-6">
              A Dream to Create<br className="hidden lg:block" /> Lasting Impact
            </h2>

            <div className="space-y-6 text-gray-600 text-base md:text-[17px] leading-relaxed">
              <p>
                Young Leaders Academy was founded with a simple but powerful belief — that every young person, no matter where they come from, deserves access to world-class education, mentorship and global opportunities.
              </p>
              <p>
                We started this journey to bridge the gap between talent and opportunity, helping students build the skills, confidence and connections they need to succeed in a rapidly changing world.
              </p>
            </div>
          </div>

          {/* Right Column - Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="group bg-white rounded-[24px] shadow-xl shadow-black/[0.04] p-6 lg:p-8 border border-[#D4AF37]/30 flex flex-col h-full animate-fade-in-up-delay-1 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mb-6 shrink-0">
                <Users className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#0B2545] font-serif font-bold text-xl mb-4">Why We Started</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We saw too many bright and talented young people without the right guidance, resources or access to global opportunities.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-[24px] shadow-xl shadow-black/[0.04] p-6 lg:p-8 border border-[#D4AF37]/30 flex flex-col h-full animate-fade-in-up-delay-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mb-6 shrink-0">
                <Binoculars className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#0B2545] font-serif font-bold text-xl mb-4">Our Vision</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To be a globally recognized academy that develops ethical, innovative and impact-driven leaders for a more inclusive and sustainable world.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-[24px] shadow-xl shadow-black/[0.04] p-6 lg:p-8 border border-[#D4AF37]/30 flex flex-col h-full animate-fade-in-up-delay-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] flex items-center justify-center mb-6 shrink-0">
                <Gem className="w-8 h-8 text-[#0B2545]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#0B2545] font-serif font-bold text-xl mb-4">Our Core Values</h3>
              <ul className="space-y-3 flex-1 flex flex-col justify-center">
                {values.map((value, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] mr-3 shrink-0"></span>
                    {value}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
