"use client";

import { motion, Variants } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Lock, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactFormSection() {
  const t = useTranslations('ContactFormSection');
  const contactInfo = [
    { icon: MapPin, title: t('info1_title'), details: [t('info1_line1'), t('info1_line2')], link: null },
    { icon: Phone, title: t('info2_title'), details: [t('info2_line1'), t('info2_line2')], link: "tel:+8801896123456" },
    { icon: Mail, title: t('info3_title'), details: [t('info3_line1'), t('info3_line2')], link: "mailto:hello@youngleadersacademy.com" },
    { icon: Clock, title: t('info4_title'), details: [t('info4_line1'), t('info4_line2')], link: null }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
  };



  return (
    <section className="w-full py-16 md:py-24 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left Column: {t('badge1')} */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge1')}
              </span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#0B2545] leading-tight mb-6">
              {t('title1')}
            </motion.h2>

            <motion.p variants={itemVariants} className="text-[#0B2545] font-sans font-medium text-base md:text-lg mb-12 max-w-md">
              {t('subtitle1')}
            </motion.p>

            <div className="flex flex-col gap-8">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <motion.div key={idx} variants={itemVariants} className="flex items-start gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#D4AF37] bg-transparent flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-[#D4AF37]/5">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col pt-1">
                      <h4 className="text-[#0B2545] font-bold text-base md:text-lg mb-1">{info.title}</h4>
                      {info.details.map((line, i) => {
                        const isLink = info.link && i === 0;
                        return isLink ? (
                          <a
                            key={i}
                            href={info.link!}
                            className="text-gray-600 text-sm md:text-base leading-relaxed hover:text-[#D4AF37] transition-colors"
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={i} className="text-gray-500 text-sm md:text-base leading-relaxed">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] p-8 md:p-12 border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] uppercase">
                  {t('form_badge')}
                </span>
              </div>

              <h3 className="text-3xl font-serif font-bold text-[#0B2545] mb-8">
                {t('form_title')}
              </h3>

              <form className="flex flex-col gap-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-bold text-[#0B2545]">
                      {t('form_name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder={t('form_name_ph')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400"
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-bold text-[#0B2545]">
                      {t('form_email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder={t('form_email_ph')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-sm font-bold text-[#0B2545]">
                    {t('form_subject')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 appearance-none"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled className="text-gray-400">{t('form_subject_default')}</option>
                    <option value="admissions">{t('form_subject_opt1')}</option>
                    <option value="programs">{t('form_subject_opt2')}</option>
                    <option value="partnerships">{t('form_subject_opt3')}</option>
                    <option value="other">{t('form_subject_opt4')}</option>
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="message" className="text-sm font-bold text-[#0B2545]">
                    {t('form_message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder={t('form_message_ph')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400 resize-none flex-1 min-h-[120px]"
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] font-bold text-sm md:text-base transition-transform duration-300 hover:scale-[1.01] shadow-md group"
                >
                  {t('form_submit')}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Footer Note */}
                <div className="flex items-center justify-start gap-2 mt-4 text-gray-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{t('form_footer')}</span>
                </div>
              </form>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
