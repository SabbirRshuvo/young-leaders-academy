"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ShieldCheck, Receipt } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaApplePay, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const t = useTranslations('Footer');
  const tf = useTranslations('Forms');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) {
      setMessage({ type: 'error', text: isAr ? 'يرجى إدخال البريد الإلكتروني والموافقة على الشروط.' : 'Please enter email and agree to terms.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        // Handle unique violation (already subscribed)
        if (error.code === '23505') {
          setMessage({ type: 'error', text: isAr ? 'هذا البريد الإلكتروني مسجل بالفعل.' : 'This email is already subscribed.' });
        } else {
          throw error;
        }
      } else {
        // Send automated email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'newsletter',
            locale,
            data: { email }
          })
        });

        setMessage({ type: 'success', text: isAr ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!' });
        setEmail('');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      setMessage({ type: 'error', text: isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-navy text-white py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-8 mb-6 w-max">
              <Image src="/logo.jpeg" alt="Logo" width={150} height={150} className="w-16 h-16 md:w-[120px] md:h-[70px] object-contain rounded-md" />
              <div className="hidden sm:flex flex-col justify-center">
                <div className="text-[14px] md:text-[16px] font-extrabold text-white leading-none tracking-[0.05em] mb-[6px]">YOUNG LEADERS</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-[1px] w-4 bg-gold"></div>
                  <div className="text-[9px] md:text-[10px] font-bold text-gold tracking-[0.2em] leading-none">ACADEMY</div>
                  <div className="h-[1px] w-4 bg-gold"></div>
                </div>
              </div>
            </Link>
            <p className="text-white text-sm font-bold leading-relaxed max-w-[250px]">
              {t('tagline')}
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaFacebook className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaInstagram className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaLinkedin className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaYoutube className="w-4 h-4" /></Link>
            </div>
          </div>

          <div className="space-y-6 lg:pl-8">
            <h4 className="text-lg font-bold text-white mb-6">{t('quickLinksTitle')}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href={`/${locale}`} className={`hover:text-gold transition-colors flex items-center justify-between group ${isAr ? 'flex-row-reverse' : ''}`}>{t('nav.home')} <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? 'rotate-180' : ''}`}>›</span></Link></li>
              <li><Link href={`/${locale}/about`} className={`hover:text-gold transition-colors flex items-center justify-between group ${isAr ? 'flex-row-reverse' : ''}`}>{t('nav.about')} <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? 'rotate-180' : ''}`}>›</span></Link></li>
              <li><Link href={`/${locale}/programs`} className={`hover:text-gold transition-colors flex items-center justify-between group ${isAr ? 'flex-row-reverse' : ''}`}>{t('nav.programs')} <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? 'rotate-180' : ''}`}>›</span></Link></li>
              <li><Link href={`/${locale}/universities`} className={`hover:text-gold transition-colors flex items-center justify-between group ${isAr ? 'flex-row-reverse' : ''}`}>{t('nav.universities')} <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? 'rotate-180' : ''}`}>›</span></Link></li>
              <li><Link href={`/${locale}/contact`} className={`hover:text-gold transition-colors flex items-center justify-between group ${isAr ? 'flex-row-reverse' : ''}`}>{t('nav.contact')} <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isAr ? 'rotate-180' : ''}`}>›</span></Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-6">{t('contactUsTitle')}</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <span>Riyadh, Saudi Arabia</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <Link href="tel:+966112345678" dir="ltr">+966 11 234 5678</Link>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <Link href="mailto:[EMAIL_ADDRESS]">example@gmail.com</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-6">{t('newsletterTitle')}</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t('newsletterDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="flex h-10 w-full rounded-sm bg-white px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                required
              />
              <div className="flex items-start gap-2 mt-1">
                <input 
                  type="checkbox" 
                  id="pdplConsentFooter"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 shrink-0 w-3.5 h-3.5 text-gold rounded border-gray-400 focus:ring-gold bg-transparent"
                  required
                />
                <label htmlFor="pdplConsentFooter" className="text-xs text-gray-400 leading-tight cursor-pointer">
                  {tf('pdplConsent')}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !consent}
                className="inline-flex h-10 items-center justify-center rounded-sm bg-gold px-4 text-sm font-bold text-navy shadow hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-navy/20 border-t-navy rounded-full animate-spin"></div>
                ) : (
                  t('subscribeButton')
                )}
              </button>
              {message && (
                <p className={`text-sm mt-1 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Trust Markers */}
        <div className={`mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
          <div className={`flex flex-wrap items-center justify-center gap-6 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 text-gray-300 ${isAr ? 'flex-row-reverse' : ''}`}>
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-semibold">{t('pdplCertified')}</span>
            </div>
            <div className="h-4 w-px bg-white/20 hidden md:block"></div>
            <div className={`flex items-center gap-2 text-gray-300 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Receipt className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-semibold">{t('vatCompliant')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 opacity-70">
            {/* Payment Icons */}
            <div className="bg-white px-2 py-1 rounded text-[#0B2545] font-bold text-xs tracking-wider">mada</div>
            <FaApplePay className="w-10 h-10 text-white" />
            <FaCcVisa className="w-8 h-8 text-white" />
            <FaCcMastercard className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-8 pt-8 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center ${isAr ? 'md:flex-row-reverse' : ''}`}>
          <p>© {new Date().getFullYear()} Young Leaders Academy. {t('rightsReserved')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0 items-center">
            <Link href={`/${locale}/privacy`} className={`hover:text-white transition-colors ${isAr ? 'ml-6' : ''}`}>{t('privacyPolicy')}</Link>
            <span className="text-gray-600">|</span>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">{t('termsConditions')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
