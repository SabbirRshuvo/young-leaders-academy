"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import React, { useState } from "react";
import TargetGroupModal, { TargetGroup } from "./TargetGroupModal";

export default function WhoWeServe() {
  const t = useTranslations('WhoWeServe');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [modalOpen, setModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<TargetGroup>('parent');

  const openModal = (group: TargetGroup) => {
    setActiveGroup(group);
    setModalOpen(true);
  };

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">

        {/* Title Tag */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-[1.5px] w-12 bg-[#C59B27]" />
          <span className="text-[#C59B27] font-bold tracking-widest text-sm uppercase">
            {t('tag')}
          </span>
        </div>

        {/* Grid Layout - 1 on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">

          {/* Card 1: Students */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative w-full min-h-[450px] bg-white overflow-hidden rounded-[24px] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col"
          >
            <div className="absolute inset-0 w-full h-full">
              <img src="/left.png" alt="Students" className="w-full h-full object-cover object-top" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-white via-white/90 to-transparent" />

            <div className="relative z-10 w-full h-full flex flex-col justify-end p-8 mt-auto" dir={isAr ? 'rtl' : 'ltr'}>
              <h3 className="text-3xl font-serif font-bold text-[#0B2545] mb-2">{t('studentsTitle')}</h3>
              <p className="text-sm font-semibold text-[#C59B27] mb-3 uppercase tracking-wide">{t('studentsSubtitle')}</p>
              <p className="text-sm font-sans text-gray-600 mb-6 leading-relaxed">
                {t('studentsDesc')}
              </p>
              <div>
                <Link
                  href={`/${locale}/programs`}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0B2545] font-bold text-sm shadow-md hover:from-[#e3be47] hover:to-[#d6a931] transition-all cursor-pointer relative z-20"
                >
                  {t('exploreMore')} {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Parents */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative w-full min-h-[450px] bg-[#0B2545] overflow-hidden rounded-[24px] border border-[#D4AF37]/30 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col"
          >
            <div className="absolute inset-0 w-full h-full">
              <img src="/right.png" alt="Parents" className="w-full h-full object-cover object-center" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-[#0B2545] via-[#0B2545]/90 to-transparent" />

            <div className="relative z-10 w-full h-full flex flex-col justify-end p-8 mt-auto" dir={isAr ? 'rtl' : 'ltr'}>
              <h3 className="text-3xl font-serif font-bold text-white mb-2">{t('parentsTitle')}</h3>
              <p className="text-sm font-semibold text-[#D4AF37] mb-3 uppercase tracking-wide">{t('parentsSubtitle')}</p>
              <p className="text-sm font-sans text-gray-300 mb-6 leading-relaxed">
                {t('parentsDesc')}
              </p>
              <div>
                <button
                  onClick={() => openModal('parent')}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-[#D4AF37] text-white font-bold text-sm hover:bg-white/10 transition-colors cursor-pointer relative z-20"
                >
                  {t('parentsBtn')} {isAr ? <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> : <ArrowRight className="w-4 h-4 text-[#D4AF37]" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Universities */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="group relative w-full min-h-[450px] bg-white overflow-hidden rounded-[24px] border border-[#D4AF37]/30 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col"
          >
            <div className="absolute inset-0 w-full h-full">
              <img src="/campus.png" alt="Universities" className="w-full h-full object-cover object-center" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-white via-white/90 to-transparent" />

            <div className="relative z-10 w-full h-full flex flex-col justify-end p-8 mt-auto" dir={isAr ? 'rtl' : 'ltr'}>
              <h3 className="text-3xl font-serif font-bold text-[#0B2545] mb-2">{t('universitiesTitle')}</h3>
              <p className="text-sm font-semibold text-[#C59B27] mb-3 uppercase tracking-wide">{t('universitiesSubtitle')}</p>
              <p className="text-sm font-sans text-gray-600 mb-6 leading-relaxed">
                {t('universitiesDesc')}
              </p>
              <div>
                <button
                  onClick={() => openModal('university')}
                  className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl border border-[#0B2545] text-[#0B2545] font-bold text-sm hover:bg-[#0B2545]/5 transition-colors cursor-pointer relative z-20"
                >
                  {t('universitiesBtn')} {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>



        </div>
      </div>

      <TargetGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetGroup={activeGroup}
      />
    </section>
  );
}