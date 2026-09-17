"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { X, Send, CheckCircle2, AlertCircle, CalendarPlus } from 'lucide-react';
import { Event } from '@/data/events';

interface EventRsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function EventRsvpModal({ isOpen, onClose, event }: EventRsvpModalProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations('EventsPage');
  const tf = useTranslations('Forms');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    preferredProgram: '',
    consent: false
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore - handling checkbox
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setErrorMsg(isAr ? 'يجب الموافقة على سياسة الخصوصية' : 'You must agree to the privacy policy');
      return;
    }
    if (!event) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: isAr ? event.titleAr : event.titleEn,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          preferredProgram: formData.preferredProgram,
          pdplConsent: formData.consent,
          locale
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
    }
  };

  const generateIcs = () => {
    if (!event) return;
    
    // Simplistic ICS generation
    const title = isAr ? event.titleAr : event.titleEn;
    const location = isAr ? event.locationAr : event.locationEn;
    const desc = `RSVP for ${title}`;
    
    // In a real scenario, use actual parsed Dates
    const startDate = new Date().toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(new Date().getTime() + 60*60*1000).toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${startDate}
DTEND:${endDate}
LOCATION:${location}
DESCRIPTION:${desc}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setFormData({ fullName: '', email: '', phone: '', role: '', preferredProgram: '', consent: false });
    }, 300);
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto my-auto ${isAr ? 'font-arabic' : 'font-sans'}`}
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="bg-[#0B2545] p-6 relative">
                <button
                  onClick={closeAndReset}
                  className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} text-white/70 hover:text-white transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2 pe-6">
                  {t('rsvpModalTitle')}
                </h3>
                <p className="text-[#D4AF37] text-sm">
                  {isAr ? event.titleAr : event.titleEn}
                </p>
              </div>

              {/* Body */}
              <div className="p-6">
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-[#0B2545] mb-2">
                      {t('successTitle')}
                    </h4>
                    <p className="text-gray-600 text-sm mb-6">
                      {t('successDesc')}
                    </p>
                    
                    <button
                      onClick={generateIcs}
                      className="w-full mb-3 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[#0B2545] text-[#0B2545] font-bold hover:bg-[#0B2545] hover:text-white transition-all"
                    >
                      <CalendarPlus className="w-5 h-5" />
                      {t('addToCalendar')}
                    </button>
                    
                    <button
                      onClick={closeAndReset}
                      className="text-gray-500 text-sm hover:text-gray-700 underline"
                    >
                      {isAr ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {isAr ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-bold text-[#0B2545]">
                          {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-bold text-[#0B2545]">
                          {isAr ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <input 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          required 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {t('roleLabel')}
                      </label>
                      <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white appearance-none"
                      >
                        <option value="" disabled>{isAr ? 'اختر دورك' : 'Select your role'}</option>
                        <option value="student">{t('roleStudent')}</option>
                        <option value="parent">{t('roleParent')}</option>
                        <option value="school">{t('roleSchool')}</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {t('programLabel')}
                      </label>
                      <input 
                        type="text" 
                        name="preferredProgram" 
                        value={formData.preferredProgram} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white"
                        placeholder={isAr ? 'اختياري' : 'Optional'}
                      />
                    </div>

                    <div className="flex items-start gap-3 mt-1">
                      <input 
                        type="checkbox" 
                        name="consent"
                        id="pdplConsentEvents"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 shrink-0 w-4 h-4 text-[#0B2545] rounded border-gray-300 focus:ring-[#0B2545]"
                        required
                      />
                      <label htmlFor="pdplConsentEvents" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                        {tf('pdplConsent')}
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 mt-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-xs text-red-700">{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className={`w-full mt-3 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md min-h-[44px] ${
                        status === 'submitting'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#0B2545] to-[#1A3A65] text-white hover:from-[#133055] hover:to-[#0B2545]'
                      }`}
                    >
                      {status === 'submitting' ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {status === 'submitting' ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : t('rsvpBtn')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
