"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReadinessQuizPage() {
  const t = useTranslations('Quiz');
  const tf = useTranslations('Forms');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const [answers, setAnswers] = useState({
    gradeLevel: '',
    focusArea: '',
    preferredDestination: ''
  });

  const [leadInfo, setLeadInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    consent: false
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Mount animation trigger
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectOption = (field: keyof typeof answers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    // Auto-advance after short delay if not on last steps
    if (currentStep < 3) {
      setTimeout(() => {
        handleNext();
      }, 400);
    } else if (currentStep === 3) {
      setTimeout(() => {
        handleNext();
      }, 400);
    }
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLeadInfo(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.consent) {
      setErrorMsg(isAr ? 'يجب الموافقة على سياسة الخصوصية' : 'You must agree to the privacy policy');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    // Generate mock score between 75 and 95
    const score = Math.floor(Math.random() * (95 - 75 + 1) + 75);

    try {
      const res = await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          ...leadInfo,
          pdplConsent: leadInfo.consent,
          readinessScore: score,
          locale
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quiz');
      }
      
      setFinalScore(score);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (!mounted) return null;

  if (status === 'success' && finalScore !== null) {
    return (
      <main className={`min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl w-full text-center border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-[#0B2545] mb-4 relative z-10">
            {t('resultsTitle')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto relative z-10 text-lg">
            {t('resultsDesc')}
          </p>
          
          <div className="flex flex-col items-center justify-center py-8 mb-8 relative z-10 border-y border-gray-100">
            <span className="text-6xl md:text-7xl font-extrabold text-[#D4AF37] mb-2">{finalScore}</span>
            <span className="text-gray-400 font-bold uppercase tracking-wider">{t('scoreOutOf')}</span>
          </div>
          
          <Link
            href={`/${locale}/programs`}
            className="inline-flex items-center justify-center gap-2 bg-[#0B2545] text-white hover:bg-[#133055] px-8 py-4 rounded-xl font-bold transition-all shadow-md w-full sm:w-auto relative z-10 min-h-[52px]"
          >
            {t('ctaBtn')}
            {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-[#F8F9FA] flex flex-col pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${isAr ? 'font-arabic' : 'font-sans'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl w-full mx-auto flex-grow flex flex-col relative">
        
        {/* Header & Progress */}
        <div className="mb-8">
          <div className={`flex items-center gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-[#0B2545]/5 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-[#0B2545]" />
            </div>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h1 className="text-xl md:text-2xl font-bold font-serif text-[#0B2545]">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <motion.div 
              className="bg-[#D4AF37] h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-2 text-xs font-bold text-gray-400 text-end w-full">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-grow flex flex-col relative overflow-hidden bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <AnimatePresence custom={direction} mode="wait">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col p-6 md:p-10 h-full"
              >
                <h2 className="text-2xl font-bold text-[#0B2545] mb-8">{t('step1Title')}</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { val: 'Grade 10', label: t('s1Opt1') },
                    { val: 'Grade 11', label: t('s1Opt2') },
                    { val: 'Grade 12', label: t('s1Opt3') },
                    { val: 'University Prep', label: t('s1Opt4') },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => handleSelectOption('gradeLevel', opt.val)}
                      className={`flex items-center justify-between p-4 min-h-[56px] rounded-xl border-2 transition-all ${
                        answers.gradeLevel === opt.val 
                          ? 'border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545]' 
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers.gradeLevel === opt.val ? 'border-[#0B2545]' : 'border-gray-300'}`}>
                        {answers.gradeLevel === opt.val && <div className="w-2.5 h-2.5 bg-[#0B2545] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col p-6 md:p-10 h-full"
              >
                <h2 className="text-2xl font-bold text-[#0B2545] mb-8">{t('step2Title')}</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { val: 'STEM & Tech', label: t('s2Opt1') },
                    { val: 'Business & Leadership', label: t('s2Opt2') },
                    { val: 'Medicine & Healthcare', label: t('s2Opt3') },
                    { val: 'Humanities & Arts', label: t('s2Opt4') },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => handleSelectOption('focusArea', opt.val)}
                      className={`flex items-center justify-between p-4 min-h-[56px] rounded-xl border-2 transition-all ${
                        answers.focusArea === opt.val 
                          ? 'border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545]' 
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers.focusArea === opt.val ? 'border-[#0B2545]' : 'border-gray-300'}`}>
                        {answers.focusArea === opt.val && <div className="w-2.5 h-2.5 bg-[#0B2545] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col p-6 md:p-10 h-full"
              >
                <h2 className="text-2xl font-bold text-[#0B2545] mb-8">{t('step3Title')}</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { val: 'Top Saudi Universities', label: t('s3Opt1') },
                    { val: 'UK & Europe', label: t('s3Opt2') },
                    { val: 'USA & Canada', label: t('s3Opt3') },
                    { val: 'Undecided', label: t('s3Opt4') },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => handleSelectOption('preferredDestination', opt.val)}
                      className={`flex items-center justify-between p-4 min-h-[56px] rounded-xl border-2 transition-all ${
                        answers.preferredDestination === opt.val 
                          ? 'border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545]' 
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers.preferredDestination === opt.val ? 'border-[#0B2545]' : 'border-gray-300'}`}>
                        {answers.preferredDestination === opt.val && <div className="w-2.5 h-2.5 bg-[#0B2545] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col p-6 md:p-10 h-full"
              >
                <h2 className="text-2xl font-bold text-[#0B2545] mb-6">{t('step4Title')}</h2>
                
                <form id="quiz-lead-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B2545]">{t('fullName')}</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={leadInfo.fullName} 
                      onChange={handleLeadChange} 
                      required 
                      className="w-full px-4 py-3 min-h-[52px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B2545]">{t('email')}</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={leadInfo.email} 
                      onChange={handleLeadChange} 
                      required 
                      className="w-full px-4 py-3 min-h-[52px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#0B2545]">{t('phone')}</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={leadInfo.phone} 
                      onChange={handleLeadChange} 
                      required 
                      className="w-full px-4 py-3 min-h-[52px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <input 
                      type="checkbox" 
                      name="consent"
                      id="pdplConsentQuiz"
                      checked={leadInfo.consent}
                      onChange={handleLeadChange}
                      className="mt-1 shrink-0 w-4 h-4 text-[#0B2545] rounded border-gray-300 focus:ring-[#0B2545]"
                      required
                    />
                    <label htmlFor="pdplConsentQuiz" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                      {tf('pdplConsent')}
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs text-red-700">{errorMsg}</span>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || status === 'submitting'}
            className={`px-6 py-3 min-h-[52px] rounded-xl font-bold text-sm transition-all ${
              currentStep === 1 || status === 'submitting'
                ? 'opacity-0 pointer-events-none'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {t('btnBack')}
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !answers.gradeLevel) ||
                (currentStep === 2 && !answers.focusArea) ||
                (currentStep === 3 && !answers.preferredDestination)
              }
              className="flex items-center gap-2 px-8 py-3 min-h-[52px] rounded-xl font-bold text-sm bg-[#0B2545] text-white hover:bg-[#133055] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {t('btnNext')}
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="submit"
              form="quiz-lead-form"
              disabled={status === 'submitting'}
              className={`flex items-center gap-2 px-8 py-3 min-h-[52px] rounded-xl font-bold text-sm transition-all shadow-md ${
                status === 'submitting'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0B2545] hover:from-[#e3be47] hover:to-[#d6a931]'
              }`}
            >
              {status === 'submitting' ? (
                <div className="w-4 h-4 border-2 border-[#0B2545]/20 border-t-[#0B2545] rounded-full animate-spin"></div>
              ) : null}
              {status === 'submitting' ? t('submitting') : t('btnSubmit')}
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
