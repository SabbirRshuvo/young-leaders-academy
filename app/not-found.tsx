"use client";

import "@/app/globals.css";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import Image from "next/image";

export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E293B] relative overflow-hidden font-sans m-0 p-0 overflow-x-hidden">
          
          {/* Dynamic Background Effects */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[150px] pointer-events-none" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          {/* Main Content Container (Glassmorphism) */}
          <div className="relative z-10 w-[90%] max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-16 text-center shadow-2xl flex flex-col items-center transition-all duration-500 hover:border-[#D4AF37]/30 hover:bg-white/10">
            
            {/* Floating 404 Text */}
            <div className="relative mb-8 group cursor-default">
              <h1 className="text-[8rem] md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white/90 to-white/20 leading-none drop-shadow-2xl select-none">
                404
              </h1>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37] opacity-80 group-hover:scale-110 transition-transform duration-500" style={{ animation: 'spin 12s linear infinite' }}>
                <Compass className="w-24 h-24 md:w-32 md:h-32" strokeWidth={1} />
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
              Coming Soon
            </h2>
            
            <p className="text-gray-300 mb-12 text-lg md:text-xl leading-relaxed max-w-md mx-auto">
              This page is under construction or could not be found.
            </p>

            {/* Call to Action Button */}
            <Link
              href="/"
              className="relative inline-flex items-center justify-center gap-3 rounded-full bg-[#D4AF37] px-10 py-5 text-lg font-bold text-[#1E293B] hover:bg-white hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              <span className="relative z-10">Return Home</span>
            </Link>
          </div>
          
          {/* Brand logo at bottom */}
          <div className="mt-12 relative z-10 opacity-40 hover:opacity-100 hover:scale-110 transition-all duration-500">
            <Image src="/logo.jpeg" alt="Logo" width={100} height={100} className="w-16 h-16 rounded-full border border-white/20 object-contain shadow-xl" priority />
          </div>

        </div>
      </body>
    </html>
  );
}
