"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import RequestInfoModal from './RequestInfoModal';
import { supabase } from '@/lib/supabase';

interface UniversityDetailCtaProps {
  universityId: string;
  universityName: string;
  locale: string;
  isAr: boolean;
  applyNowText: string;
  hasApplied?: boolean;
}

export default function UniversityDetailCta({
  universityId,
  universityName,
  locale,
  isAr,
  applyNowText,
  hasApplied: initialHasApplied = false,
}: UniversityDetailCtaProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialHasApplied);

  useEffect(() => {
    setHasApplied(initialHasApplied);
  }, [initialHasApplied]);

  // Client-side session check to guarantee reactivity
  useEffect(() => {
    async function checkExistingApplication() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('university_applications')
            .select('id')
            .eq('user_id', session.user.id)
            .or(`university_id.eq.${universityId},program_id.eq.${universityId}`)
            .maybeSingle();

          if (data) {
            setHasApplied(true);
          }
        }
      } catch (err) {
        console.error('Error checking university application status:', err);
      }
    }

    checkExistingApplication();
  }, [universityId]);

  return (
    <>
      <div className="bg-[#0B2545] p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <h3 className="text-2xl font-bold text-white mb-4 text-left">
          {hasApplied
            ? (isAr ? 'تم استلام طلبك' : 'Application Received')
            : (isAr ? 'هل أنت مستعد للتقديم؟' : 'Ready to Apply?')}
        </h3>
        <p className="text-gray-300 text-sm mb-8 text-left">
          {hasApplied
            ? (isAr
                ? 'لقد قمت بتقديم طلبك لهذه الجامعة مسبقاً. يمكنك متابعة حالة طلبك من خلال لوحة تحكم الطالب.'
                : 'You have already submitted an application for this university. You can track your status in your student portal.')
            : (isAr 
                ? 'ابدأ طلبك اليوم وانضم إلى نخبة الطلاب في شبكتنا الأكاديمية العالمية.' 
                : 'Start your application today and join elite students in our global academic network.')}
        </p>

        <div className="flex flex-col gap-4">
          {hasApplied ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-700/25 border border-emerald-500/40 text-emerald-300 font-bold text-lg cursor-not-allowed opacity-90 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{isAr ? 'تم التقديم مسبقاً' : 'Already Applied'}</span>
              </button>
              <Link
                href={`/${locale}/student/applications`}
                className="text-center text-xs text-[#D4AF37] hover:text-[#e3be47] hover:underline font-medium transition-colors"
              >
                {isAr ? 'عرض طلباتي في لوحة التحكم ←' : 'View your applications in portal →'}
              </Link>
            </div>
          ) : (
            <Link
              href={`/${locale}/apply?university=${universityId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-lg transition-transform duration-300 hover:scale-[1.02] shadow-lg group"
            >
              <span>{applyNowText}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          
          <button
            onClick={() => setModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-colors shadow-sm group"
          >
            <span>{isAr ? 'طلب معلومات' : 'Request Info'}</span>
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
