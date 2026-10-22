"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { programsData } from '@/data/programs';
import { universitiesData } from '@/data/universities';
import { CheckCircle2, ChevronRight, ChevronLeft, User, GraduationCap, FileText, Send, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

function ApplyFormContent() {
  const t = useTranslations('ApplyPage');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    school: '',
    program: '',
    motivation: ''
  });
  const [applicationType, setApplicationType] = useState<'program' | 'university' | null>(null);
  
  // Dynamic Data
  const [dbPrograms, setDbPrograms] = useState<any[]>([]);

  // Pre-fill program from URL if present
  useEffect(() => {
    const isProgram = searchParams.get('program');
    const isUniversity = searchParams.get('university');
    
    if (isProgram) {
      setApplicationType('program');
      setFormData(prev => ({ ...prev, program: isProgram }));
    } else if (isUniversity) {
      setApplicationType('university');
      setFormData(prev => ({ ...prev, program: isUniversity }));
    }
    
    // Fetch logged-in user profile if exists
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single();
          
        setFormData(prev => ({
          ...prev,
          email: user.email || prev.email,
          firstName: profile?.first_name || prev.firstName,
          lastName: profile?.last_name || prev.lastName,
          phone: profile?.phone || prev.phone,
        }));
      }
    };
    
    // Fetch live programs from DB
    const fetchPrograms = async () => {
      const { data } = await supabase.from('programs').select('id, title, price').order('created_at', { ascending: false });
      if (data) setDbPrograms(data);
    };
    
    fetchUserProfile();
    fetchPrograms();
  }, [searchParams]);

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    setStep(s => Math.min(s + 1, 3));
  };
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const isStep1Valid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== '';
  const isStep2Valid = formData.age.trim() !== '' && formData.school.trim() !== '' && formData.program.trim() !== '';
  const isStep3Valid = formData.motivation.trim() !== '' && consentGiven;

  const canProceed = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      setErrorMsg(
        isAr
          ? 'يرجى إكمال جميع الحقول المطلوبة والموافقة على سياسة الخصوصية.'
          : 'Please complete all required fields and give your consent.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // ----------------------------------------
      // Get selected program/university ID
      // ----------------------------------------

      const programId = formData.program.trim();

      if (!programId) {
        throw new Error('Please select a program or university.');
      }

      // ----------------------------------------
      // Find program/university display title
      // ----------------------------------------

      let programTitle = programId;
      let courseDbId: string | undefined;

      if (applicationType === 'program') {
        const foundProgram = dbPrograms.find((p) => p.id === programId);
        if (foundProgram) {
          programTitle = typeof foundProgram.title === 'string' ? foundProgram.title : foundProgram.title?.en;
          courseDbId = foundProgram.id;
        }
      } else {
        const foundUni = universitiesData.find((u) => u.id === programId);
        if (foundUni) {
          programTitle = foundUni.name;
        }
      }

      // Fetch user to attach to enrollment
      const { data: { user } } = await supabase.auth.getUser();

      if (user && applicationType === 'program') {
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('program_id', courseDbId || programId)
          .single();

        if (existingEnrollment) {
          toast.error(isAr ? 'أنت مسجل بالفعل في هذا البرنامج.' : 'You are already enrolled in this program.');
          setIsSubmitting(false);
          return;
        }
      }

      // ----------------------------------------
      // Complete application data
      // ----------------------------------------

      const applicationPayload = {
        userId: user?.id || null,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: formData.age.trim(),
        school: formData.school.trim(),
        programId: courseDbId || programId,
        programTitle,
        motivation: formData.motivation.trim(),
        locale,
        baseAmount: dbPrograms.find(p => p.id === programId)?.price || 1500,
      };

      // ----------------------------------------
      // 1. Create payment + save application
      // ----------------------------------------

      const apiEndpoint = applicationType === 'program' ? '/api/enroll-program' : '/api/apply-university';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || 'Checkout failed'
        );
      }

      // ----------------------------------------
      // 2. Send application emails
      // ----------------------------------------

      try {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'apply',
            locale,
            data: {
              first_name: applicationPayload.firstName,
              last_name: applicationPayload.lastName,
              email: applicationPayload.email,
              phone: applicationPayload.phone,
              age: applicationPayload.age,
              school: applicationPayload.school,
              program_id: applicationPayload.programTitle,
              motivation: applicationPayload.motivation,
            },
          }),
        });

        const emailData = await emailRes.json();

        if (!emailRes.ok || !emailData.success) {
          console.error(
            'Email API error:',
            emailData
          );
        } else {
          console.log(
            'Application emails sent successfully.'
          );
        }
      } catch (emailError) {
        console.error(
          'Failed to trigger email automation:',
          emailError
        );
      }

      // ----------------------------------------
      // 3. Redirect to success page or enrolled programs
      // ----------------------------------------

      if (applicationType === 'program') {
        toast.success(isAr ? 'تم التسجيل بنجاح!' : 'Successfully enrolled!');
        router.push(locale === 'en' ? '/student/enrolled-programs' : `/${locale}/student/enrolled-programs`);
        router.refresh();
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }

      setIsSubmitting(false);

    } catch (err: any) {
      console.error(
        'Error starting checkout:',
        err
      );

      setErrorMsg(
        isAr
          ? 'حدث خطأ أثناء الانتقال للدفع. يرجى المحاولة مرة أخرى.'
          : err?.message ||
          'An error occurred while proceeding to payment. Please try again.'
      );

      setIsSubmitting(false);
    }
  };


  const l = (item: { en: string; ar: string }) => isAr ? item.ar : item.en;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (isAr ? -50 : 50) : (isAr ? 50 : -50),
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? (isAr ? -50 : 50) : (isAr ? 50 : -50),
      opacity: 0
    })
  };

  // Removed local success rendering because we redirect on success

  return (
    <div className={`w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-300 ${isAr ? 'font-arabic' : 'font-sans'}`}>

      {/* Steps Header */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 -z-10 rounded-full scale-x-100"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#D4AF37] -z-10 rounded-full transition-all duration-500 scale-x-100"
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>

        {[
          { num: 1, icon: User, label: t('step1') },
          { num: 2, icon: GraduationCap, label: t('step2') },
          { num: 3, icon: FileText, label: t('step3') }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 shadow-sm ${step >= s.num
              ? 'bg-[#D4AF37] text-white border-2 border-[#D4AF37]'
              : 'bg-white text-gray-400 border-2 border-gray-200'
              }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs md:text-sm font-bold ${step >= s.num ? 'text-[#0B2545]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative overflow-hidden" dir="ltr">
        <AnimatePresence mode="wait" custom={1}>

          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('firstName')}</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder={t('firstNamePh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('lastName')}</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder={t('lastNamePh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('email')}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder={t('emailPh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left" dir="ltr" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('phone')}</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder={t('phonePh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left" dir="ltr" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('age')}</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder={t('agePh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left" dir="ltr" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#0B2545]">{t('school')}</label>
                  <input type="text" name="school" value={formData.school} onChange={handleChange} required placeholder={t('schoolPh')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#0B2545]">{t('program')}</label>
                <select name="program" value={formData.program} onChange={handleChange} required className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white appearance-none ${isAr ? 'text-right' : 'text-left'}`}>
                  <option value="" disabled>{t('programPh')}</option>
                  
                  {(!applicationType || applicationType === 'program') && (
                    <optgroup label={isAr ? "البرامج" : "Programs"}>
                      {dbPrograms.map(p => (
                        <option key={p.id} value={p.id}>{typeof p.title === 'string' ? p.title : p.title?.en}</option>
                      ))}
                    </optgroup>
                  )}
                  
                  {(!applicationType || applicationType === 'university') && (
                    <optgroup label={isAr ? "الجامعات" : "Universities"}>
                      {universitiesData.map(u => (
                        <option key={u.id} value={u.id}>{l({ en: u.name, ar: (u as any).name_ar || u.name })}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#0B2545]">{t('motivation')}</label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  required
                  placeholder={t('motivationPh')}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
                />
              </div>

              {/* VAT Breakdown */}
              <div className="p-5 rounded-2xl bg-[#0B2545]/5 border border-[#0B2545]/10 mt-2">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span>{t('vatBase')}</span>
                  <span className="font-medium">1,500 {t('sar')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <span>{t('vatLabel')}</span>
                  <span className="font-medium">225 {t('sar')}</span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-[#0B2545]">
                  <span>{t('vatTotal')}</span>
                  <span>1,725 {t('sar')}</span>
                </div>
              </div>

              {/* PDPL Consent */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-md checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-colors peer cursor-pointer"
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-600 leading-relaxed select-none group-hover:text-gray-800 transition-colors">
                  {t('pdplConsent')}
                </span>
              </label>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Form Navigation Buttons */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-[#0B2545] font-bold bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t('prevBtn')}
            </button>
          ) : (
            <div></div> // empty spacer
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md ${canProceed()
                ? 'bg-[#0B2545] text-white hover:bg-[#1a365d] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                }`}
            >
              {t('nextBtn')}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md ${isSubmitting || !canProceed()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0B2545] hover:from-[#e3be47] hover:to-[#d6a931]'
                }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#0B2545]/20 border-t-[#0B2545] rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? (isAr ? 'جاري الانتقال للدفع...' : 'Proceeding to Payment...') : (isAr ? 'الانتقال للدفع' : 'Proceed to Payment')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ApplyPage() {
  const t = useTranslations('ApplyPage');

  return (
    <div className="w-full min-h-screen bg-slate-50 py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Page Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4AF37]/20">
            {t('badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2545] mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-lg max-w-xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Form Container */}
        <Suspense fallback={<div className="w-full h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div></div>}>
          <ApplyFormContent />
        </Suspense>

      </div>
    </div>
  );
}
