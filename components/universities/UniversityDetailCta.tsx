"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import RequestInfoModal from './RequestInfoModal';

interface UniversityDetailCtaProps {
  universityId: string;
  universityName: string;
  locale: string;
  isAr: boolean;
  applyNowText: string;
}

export default function UniversityDetailCta({
  universityId,
  universityName,
  locale,
  isAr,
  applyNowText
}: UniversityDetailCtaProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[#0B2545] p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <h3 className={`text-2xl font-bold text-white mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
          {isAr ? 'هل أنت مستعد للتقديم؟' : 'Ready to Apply?'}
        </h3>
        <p className={`text-gray-300 text-sm mb-8 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
          {isAr 
            ? 'ابدأ طلبك اليوم وانضم إلى نخبة الطلاب في شبكتنا الأكاديمية العالمية.' 
            : 'Start your application today and join elite students in our global academic network.'}
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href={`/${locale}/apply?university=${universityId}`}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group ${isAr ? 'flex-row-reverse' : ''}`}
          >
            {applyNowText}
            {isAr ? (
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            )}
          </Link>
          
          <button
            onClick={() => setModalOpen(true)}
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-colors shadow-sm group ${isAr ? 'flex-row-reverse' : ''}`}
          >
            {isAr ? 'طلب معلومات' : 'Request Info'}
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <RequestInfoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        universityId={universityId} 
        universityName={universityName} 
      />
    </>
  );
}
