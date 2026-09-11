import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Partners() {
  const partners = [
    { name: "HARVARD", sub: "UNIVERSITY", color: "text-red-800" },
    { name: "Stanford", sub: "University", color: "text-red-700" },
    { name: "MIT", sub: "Massachusetts Institute of Technology", color: "text-red-600" },
    { name: "Yale", sub: "University", color: "text-blue-900" },
    { name: "OXFORD", sub: "UNIVERSITY OF", color: "text-blue-800" },
    { name: "Cambridge", sub: "University", color: "text-cyan-800" },
  ];
  
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
        <div className="flex flex-col items-center justify-center space-y-4 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold"></div>
            <span className="text-gold font-bold tracking-widest text-xs">OUR UNIVERSITY PARTNERS</span>
            <div className="h-[1px] w-12 bg-gold"></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy">
            Top Universities. Global Opportunities.
          </h2>
          <p className="max-w-[800px] text-gray-500 md:text-lg">
            Our partnerships with leading universities open doors to world-class education and endless possibilities.
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <button className="absolute left-0 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-navy transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="flex justify-center items-center gap-4 px-12 overflow-hidden w-full max-w-6xl">
            {partners.map((partner, i) => (
               <div 
                 key={i} 
                 className="flex-shrink-0 w-40 h-20 md:w-48 md:h-24 bg-white border border-gray-200 rounded-md flex flex-col items-center justify-center p-2 shadow-sm"
               >
                 {partner.sub === "UNIVERSITY OF" && <div className="text-[8px] font-bold text-gray-500 mb-0.5">{partner.sub}</div>}
                 <div className={`text-lg md:text-2xl font-serif font-bold leading-none ${partner.color}`}>
                   {partner.name}
                 </div>
                 {partner.sub !== "UNIVERSITY OF" && <div className="text-[8px] md:text-[10px] font-sans font-semibold text-gray-600 mt-1 text-center leading-tight">{partner.sub}</div>}
               </div>
            ))}
          </div>

          <button className="absolute right-0 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-navy transition-colors">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="flex justify-center items-center gap-2 mt-8">
          <div className="w-2.5 h-2.5 rounded-full bg-gold"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </section>
  );
}
