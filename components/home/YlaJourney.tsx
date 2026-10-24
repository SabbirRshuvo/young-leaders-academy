"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { BookOpen, TrendingUp, Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function YlaJourney() {
  const t = useTranslations('YlaJourney');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const steps = [
    {
      stepNumber: "01",
      icon: BookOpen,
      image: "/card1.png",
      titleEn: "1. Enroll in Programs",
      titleAr: "١. التسجيل في البرامج",
      descEn: "Enroll in premier student development programs, interactive workshops, and accredited leadership tracks.",
      descAr: "استكشف برامج تطوير الطلاب المتميزة، وانضم إلى ورش القيادة والمخيمات التفاعلية المعتمدة.",
      tagEn: "Skill Development",
      tagAr: "تطوير المهارات",
      ctaEn: "Explore Programs",
      ctaAr: "استكشف البرامج",
      href: `/${locale}/programs`
    },
    {
      stepNumber: "02",
      icon: TrendingUp,
      image: "/card3.png",
      titleEn: "2. Track Progress",
      titleAr: "٢. متابعة التقدم",
      descEn: "Track your learning milestones, master modules, and build a verified digital leadership portfolio.",
      descAr: "تابع إنجازاتك التعليمية خطوة بخطوة، وأكمل المقررات، وابنِ ملفاً قيادياً رقمياً معتمداً.",
      tagEn: "Digital Portfolio",
      tagAr: "الملف الرقمي",
      ctaEn: "Check Readiness",
      ctaAr: "قياس الجاهزية",
      href: `/${locale}/readiness-quiz`
    },
    {
      stepNumber: "03",
      icon: Globe,
      image: "/campus.png",
      titleEn: "3. Match & Apply",
      titleAr: "٣. التطابق والتقديم",
      descEn: "Match with world-class partner universities and submit direct applications to secure your global future.",
      descAr: "تطابق مع نخبة الجامعات العالمية الشريكة، وقدّم طلبات القبول مباشرة لفتح آفاقك المستقبلية.",
      tagEn: "Global Admissions",
      tagAr: "القبول العالمي",
      ctaEn: "Browse Universities",
      ctaAr: "تصفح الجامعات",
      href: `/${locale}/universities`
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } 
    }
  };

  return (
    <section className={`relative w-full py-20 md:py-32 bg-[#0B2545] overflow-hidden ${isAr ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-xs md:text-sm uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              {isAr ? 'كيف تعمل الأكاديمية' : 'How YLA Works'}
            </span>
            <div className="h-[2px] w-8 md:w-12 bg-[#D4AF37]"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            {isAr ? 'رحلة الأكاديمية نحو التميز' : 'The YLA Journey'}
          </h2>
          
          <p className="text-slate-300 text-sm md:text-base lg:text-lg max-w-2xl font-sans leading-relaxed">
            {isAr 
              ? 'مسار واضح من ٣ خطوات مدروسة ينقلك من استكشاف إمكاناتك القيادية إلى القبول في أعرق الجامعات العالمية.' 
              : 'A clear 3-step pathway from discovering your potential to matching and applying with top-tier global universities.'}
          </p>
        </motion.div>

        {/* ================= 3-STEP VISUAL CARDS GRID ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const title = isAr ? step.titleAr : step.titleEn;
            const desc = isAr ? step.descAr : step.descEn;
            const tag = isAr ? step.tagAr : step.tagEn;
            const cta = isAr ? step.ctaAr : step.ctaEn;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative flex flex-col bg-gradient-to-b from-white/[0.08] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.05] backdrop-blur-md rounded-3xl border border-white/10 hover:border-[#D4AF37]/50 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 ease-in-out overflow-hidden"
              >
                {/* Top Ambient Glow on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30"></div>

                {/* Card Visual Thumbnail Image Section */}
                <div className="relative w-full h-52 sm:h-56 bg-slate-900/60">
                  {/* Inner Image Container with overflow-hidden */}
                  <div className="w-full h-full overflow-hidden">
                    <img
                      src={step.image}
                      alt={title}
                      className="w-full h-full object-cover object-center transition-opacity duration-300"
                    />
                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545] via-[#0B2545]/40 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Step Number Badge */}
                  <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} px-3.5 py-1 rounded-full bg-[#0B2545]/85 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs tracking-wider uppercase shadow-lg flex items-center gap-1.5 z-10 pointer-events-none`}>
                    <span>{isAr ? `خطوة ${step.stepNumber}` : `Step ${step.stepNumber}`}</span>
                  </div>

                  {/* Feature Tag */}
                  <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 font-medium text-[11px] shadow-sm z-10 pointer-events-none`}>
                    {tag}
                  </div>

                  {/* Floating Circular Icon Accent bridging Image and Body (Fully uncropped) */}
                  <div className={`absolute -bottom-7 ${isAr ? 'right-6' : 'left-6'} w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8902E] text-[#0B2545] p-3.5 flex items-center justify-center shadow-2xl border-4 border-[#0B2545] z-20 pointer-events-none`}>
                    <Icon className="w-6 h-6 text-[#0B2545]" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Card Content Section */}
                <div className="p-6 sm:p-7 pt-11 flex flex-col flex-1 text-left relative z-10">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2.5 group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1 font-sans">
                    {desc}
                  </p>

                  {/* Card Action Link */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D4AF37] group-hover:text-white transition-colors"
                    >
                      <span>{cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-white/40 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                      <span>{isAr ? 'معتمد' : 'Verified'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ================= BOTTOM CTA BANNER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md"
        >
          <div className="text-center sm:text-left">
            <h4 className="text-lg sm:text-xl font-bold text-white mb-1 font-serif">
              {isAr ? 'جاهز لبدء رحلتك القيادية معنا؟' : 'Ready to begin your leadership journey?'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              {isAr ? 'انضم إلى آلاف الطلاب الذين يصنعون مستقبلهم الأكاديمي والمهني.' : 'Join hundreds of ambitious students developing real-world skills today.'}
            </p>
          </div>

          <Link
            href={`/${locale}/sign-up`}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#D4AF37] hover:bg-[#c49f2e] text-[#0B2545] font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all shrink-0"
          >
            <span>{isAr ? 'ابدأ الآن مجاناً' : 'Get Started Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
