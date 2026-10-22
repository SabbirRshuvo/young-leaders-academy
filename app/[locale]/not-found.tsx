"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-navy relative overflow-hidden font-sans"
      dir="ltr"
    >
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gold/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />

      {/* Main Content Container (Glassmorphism) */}
      <div className="relative z-10 w-[90%] max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-16 text-center shadow-2xl flex flex-col items-center transition-all duration-500 hover:border-gold/30 hover:bg-white/10">
        
        {/* Floating 404 Text */}
        <div className="relative mb-8 group cursor-default">
          <h1 className="text-[8rem] md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white/90 to-white/20 leading-none drop-shadow-2xl select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold animate-spin-slow opacity-80 group-hover:scale-110 transition-transform duration-500">
            <Compass className="w-24 h-24 md:w-32 md:h-32" strokeWidth={1} />
          </div>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
          {t("title")}
        </h2>
        
        <p className="text-gray-300 mb-12 text-lg md:text-xl leading-relaxed max-w-md mx-auto">
          {t("desc")}
        </p>

        {/* Call to Action Button */}
        <Link
          href={`/${locale === "en" ? "" : locale}`}
          className="relative inline-flex items-center justify-center gap-3 rounded-full bg-gold px-10 py-5 text-lg font-bold text-navy hover:bg-white hover:text-navy hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
        >
          {/* Button Shine Effect */}
          <div className="absolute inset-0 -translate-x-full bg-white/40 skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          
          <span className="relative z-10">{t("back")}</span>
          
        </Link>
      </div>
      
      {/* Brand logo at bottom */}
      <div className="mt-12 relative z-10 opacity-40 hover:opacity-100 hover:scale-110 transition-all duration-500">
        <Image src="/logo.jpeg" alt="Logo" width={100} height={100} className="w-16 h-16 rounded-full border border-white/20 object-contain shadow-xl" priority />
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
