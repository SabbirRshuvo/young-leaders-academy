"use client";

import Image from 'next/image';

interface ProgramsHeroProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function ProgramsHero({ selectedCategory, setSelectedCategory }: ProgramsHeroProps) {
  const categories = [
    'All Programs',
    'High School Leadership',
    'Global Mentorship',
    'Executive Skills',
    'Summer Camps'
  ];

  return (
    <section className="relative w-full">
      {/* Hero Banner Area */}
      <div className="relative w-full h-[500px] md:h-[600px]  flex items-center">

        {/* Background Image */}
        <Image
          src="/program-banner.png" // Placeholder image
          alt="Students"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0"></div>

        {/* Content Container */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full relative z-10">
          <div className="max-w-2xl lg:max-w-3xl animate-fade-in-up">

            {/* Tagline */}
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
                Our Programs
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-white font-serif text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Shaping Tomorrow's Leaders Through Specialized Programs
            </h1>

            {/* Subtitle */}
            <p className="text-gray-200 text-base md:text-lg lg:text-[19px] leading-relaxed max-w-xl font-sans">
              From academic excellence to global exposure, our programs are designed to help young people build skills, confidence and a clear path to a brighter future.
            </p>

          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="w-full bg-white border-b border-gray-100 shadow-sm relative z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-start md:justify-center overflow-x-auto hide-scrollbar gap-3 md:gap-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isActive
                  ? 'bg-[#0B2545] text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#0B2545]'
                  }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  );
}
