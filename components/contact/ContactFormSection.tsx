"use client";

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';

export default function ContactFormSection() {
  const t = useTranslations('ContactFormSection');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValid = formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.subject.trim() !== '' &&
    formData.message.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            full_name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        ]);

      if (error) throw error;
      
      // Send automated email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          locale,
          data: {
            full_name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        })
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setErrorMsg(isAr ? "حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى." : "An error occurred while sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
            <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.04] p-8 md:p-12 border border-gray-300 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] uppercase">
                  {t('form_badge')}
                </span>
              </div>

              <h3 className="text-3xl font-serif font-bold text-[#0B2545] mb-8">
                {t('form_title')}
              </h3>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#0B2545] mb-3">
                    {isAr ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}
                  </h4>
                  <p className="text-gray-500 mb-8 max-w-sm">
                    {isAr
                      ? 'شكرا لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.'
                      : 'Thank you for reaching out. Our team will get back to you as soon as possible.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="px-6 py-3 rounded-full border border-gray-300 text-[#0B2545] font-bold hover:bg-gray-50 transition-colors"
                  >
                    {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-sm font-bold text-[#0B2545]">
                        {t('form_name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('form_name_ph')}
                        className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400 ${isAr ? 'text-right' : 'text-left'}`}
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
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('form_email_ph')}
                        className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400 text-left`}
                        dir="ltr"
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
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 appearance-none ${isAr ? 'text-right' : 'text-left'}`}
                      required
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
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder={t('form_message_ph')}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all text-sm text-gray-800 placeholder:text-gray-400 resize-none flex-1 min-h-[120px] ${isAr ? 'text-right' : 'text-left'}`}
                      required
                    ></textarea>
                  </div>

                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{errorMsg}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className={`w-full mt-2 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-sm md:text-base transition-transform duration-300 shadow-md group ${isSubmitting || !isValid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#e3be47] hover:to-[#d6a931] text-[#0B2545] hover:scale-[1.01]'
                      }`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-[#0B2545]/20 border-t-[#0B2545] rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                    )}
                    {isSubmitting ? (isAr ? 'جاري الإرسال...' : 'Sending...') : t('form_submit')}
                  </button>

                  {/* Footer Note */}
                  <div className="flex items-center justify-start gap-2 mt-4 text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{t('form_footer')}</span>
                  </div>
                </form>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
