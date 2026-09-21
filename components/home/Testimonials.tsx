"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const t = useTranslations("Testimonials");
  const locale = useLocale();
  const isAr = locale === "ar";

  const testimonials = [
    {
      id: 1,
      text: t("t1Text"),
      author: t("t1Author"),
      role: t("t1Role"),
      image: "/student.png" // placeholder/generic
    },
    {
      id: 2,
      text: t("t2Text"),
      author: t("t2Author"),
      role: t("t2Role"),
      image: "/parent.png" // placeholder/generic
    },
    {
      id: 3,
      text: t("t3Text"),
      author: t("t3Author"),
      role: t("t3Role"),
      image: "/right.png" // placeholder/generic
    }
  ];

  return (
    <section className="w-full py-20 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-[30px] bg-[#D4AF37]" />
            <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.4em] text-[#B8902E]">
              {t("badge")}
            </span>
            <span className="h-[1px] w-[30px] bg-[#D4AF37]" />
          </div>

          <h2 className="m-0 font-serif text-[36px] md:text-[46px] leading-[1.1] tracking-tight text-[#0B2545]">
            <span className="font-bold text-[#0B2545]/90">{t("title1")}</span>{' '}
            <span className="font-bold">{t("title2")}</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative bg-white rounded-3xl p-8 md:p-10 flex flex-col shadow-[0_8px_30px_rgb(11,37,69,0.08)] border border-gray-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(11,37,69,0.12)] transition-all duration-300 ${isAr ? "text-right" : "text-left"}`}
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-[#D4AF37]/10" fill="currentColor" />

              <p className="text-[#0B2545]/80 text-lg md:text-xl leading-relaxed mb-10 flex-grow font-serif relative z-10">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0B2545] text-white flex items-center justify-center shrink-0 border-2 border-white shadow-md">
                  <span className="font-bold text-xl font-serif">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-[#0B2545] text-base">{testimonial.author}</h4>
                  <p className="text-sm text-[#D4AF37] font-medium">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
