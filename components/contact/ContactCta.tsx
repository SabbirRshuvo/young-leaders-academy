"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ContactCta() {
  const t = useTranslations('ContactCta');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Insert into Supabase
      const { error: dbError } = await supabase
        .from('community_subscribers')
        .insert([{ email, locale }]);

      if (dbError) {
        if (dbError.code === '23505') { // Unique violation
          throw new Error('You have already joined our community!');
        }
        throw dbError;
      }

      // 2. Send email via API
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'newsletter', data: { email }, locale }),
      });

      if (!res.ok) {
        console.warn('Failed to send welcome email, but subscription was successful.');
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

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
    <section className="relative w-full overflow-hidden flex items-center min-h-[400px] md:min-h-[450px]">

      <Image
        src="/about-banner.png"
        alt="Hikers on a mountain summit"
        fill
        sizes="100vw"
        className="object-cover"
        quality={75}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 md:py-20 relative z-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                {t('badge')}
              </span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-white font-serif text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              {t('title')}
            </motion.h2>

            <motion.p variants={itemVariants} className="text-gray-200 text-sm md:text-base leading-relaxed font-sans max-w-md">
              {t('subtitle')}
            </motion.p>
          </motion.div>

          {/* Right Newsletter Input */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full lg:max-w-md ml-auto"
          >
            {status === 'success' ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0B2545]/60 border border-green-500/30 backdrop-blur-md">
                <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                <p className="text-white text-sm">
                  {locale === 'ar' ? 'شكراً لانضمامك! تم إرسال بريد الترحيب.' : 'Thank you for joining! A welcome email has been sent.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <form onSubmit={handleSubmit} className="relative flex items-center w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('input_ph')}
                    disabled={status === 'loading'}
                    className="w-full h-14 md:h-16 pl-6 pr-[72px] rounded-lg bg-[#0B2545]/50 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all backdrop-blur-md disabled:opacity-50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-1 top-1 bottom-1 w-12 md:w-14 rounded-md bg-[#D4AF37] hover:bg-[#C59B27] flex items-center justify-center transition-colors group disabled:opacity-50 disabled:hover:bg-[#D4AF37]"
                    aria-label="Subscribe to newsletter"
                  >
                    {status === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-[#0B2545]/30 border-t-[#0B2545] rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight className="w-5 h-5 text-[#0B2545] transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                    )}
                  </button>
                </form>
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-300 text-xs md:text-sm mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage === 'You have already joined our community!' ? (locale === 'ar' ? 'لقد قمت بالانضمام مسبقاً!' : 'You have already joined our community!') : errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
