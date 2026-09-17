"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, MapPin, Monitor, Users, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventsPreview() {
  const t = useTranslations("EventsPreview");
  const locale = useLocale();
  const isAr = locale === "ar";

  const events = [
    {
      id: 1,
      title: t("event1Title"),
      date: t("event1Date"),
      location: t("event1Loc"),
      type: "in-person",
      typeLabel: t("typeInPerson"),
      icon: Users
    },
    {
      id: 2,
      title: t("event2Title"),
      date: t("event2Date"),
      location: t("event2Loc"),
      type: "virtual",
      typeLabel: t("typeVirtual"),
      icon: Monitor
    },
    {
      id: 3,
      title: t("event3Title"),
      date: t("event3Date"),
      location: t("event3Loc"),
      type: "in-person",
      typeLabel: t("typeInPerson"),
      icon: Users
    }
  ];

  return (
    <section className="w-full py-16 bg-[#F8F9FA] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B2545]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 ${isAr ? "md:flex-row-reverse" : ""}`}>
          <div className="flex flex-col items-center md:items-start max-w-2xl text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 self-center md:self-start">
              <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-[#B8902E]">
                {t("badge")}
              </span>
              <span className="h-[1px] w-[40px] bg-[#D4AF37]" />
            </div>
            
            <h2 className="m-0 font-serif text-[36px] md:text-[46px] leading-[1.1] tracking-tight text-[#0B2545]">
              <span className="font-normal italic text-[#0B2545]/90">{t("title1")}</span>{' '}
              <span className="font-bold">{t("title2")}</span>
            </h2>
          </div>
          
          <Link
            href={`/${locale}/events`}
            className={`hidden md:inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#0B2545] text-[#0B2545] font-bold hover:bg-[#0B2545] hover:text-white transition-colors ${isAr ? "flex-row-reverse" : ""}`}
          >
            {t("viewAllBtn")}
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${isAr ? "text-right" : "text-left"}`}
            >
              <div className={`flex justify-between items-start mb-6 ${isAr ? "flex-row-reverse" : ""}`}>
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-max ${
                    event.type === 'virtual' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  } ${isAr ? 'flex-row-reverse' : ''}`}>
                    <event.icon className="w-3.5 h-3.5" />
                    {event.typeLabel}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#0B2545]/5 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#0B2545]" />
                </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#0B2545] mb-4 line-clamp-2 min-h-[56px]" dir={isAr ? 'rtl' : 'ltr'}>
                {event.title}
              </h3>

              <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100">
                <div className={`flex items-center gap-2 text-sm text-gray-600 ${isAr ? "flex-row-reverse" : ""}`}>
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{event.date}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm text-gray-600 ${isAr ? "flex-row-reverse" : ""}`}>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              </div>

              <Link
                href={`/${locale}/events/${event.id}`}
                className={`mt-6 inline-flex justify-center items-center gap-2 w-full py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold hover:bg-[#133055] transition-colors ${isAr ? "flex-row-reverse" : ""}`}
              >
                {t("registerBtn")}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href={`/${locale}/events`}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 w-full max-w-xs rounded-full border-2 border-[#0B2545] text-[#0B2545] font-bold hover:bg-[#0B2545] hover:text-white transition-colors ${isAr ? "flex-row-reverse" : ""}`}
          >
            {t("viewAllBtn")}
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

      </div>
    </section>
  );
}
