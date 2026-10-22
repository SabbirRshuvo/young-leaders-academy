"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, ArrowLeft, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function ReadinessQuizBanner() {
  const t = useTranslations("ReadinessQuiz");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="w-full bg-[#F8F9FA] px-4 sm:px-6 lg:px-12 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-[1440px] mx-auto bg-gradient-to-r from-[#0B2545] to-[#1a3a65] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-serif text-white">
              {t("title")}
            </h3>
          </div>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed" dir="ltr">
            {t("desc")}
          </p>
        </div>

        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <Link
            href={`/${locale}/readiness-quiz`}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg w-full md:w-auto"
          >
            {t("btn")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
