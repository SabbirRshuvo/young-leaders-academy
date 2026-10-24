"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface RequestProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestProposalModal({ isOpen, onClose }: RequestProposalModalProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const tf = useTranslations('Forms');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    schoolName: '',
    role: '',
    consent: false
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setErrorMsg(isAr ? 'يجب الموافقة على سياسة الخصوصية' : 'You must agree to the privacy policy');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      // In a real app, you would send this to an API route (e.g., /api/request-proposal)
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({ fullName: '', email: '', phone: '', schoolName: '', role: '', consent: false });
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto my-auto max-h-[90vh] flex flex-col ${isAr ? 'font-arabic' : 'font-sans'}`}
              dir="ltr"
            >
              {/* Header */}
              <div className="bg-[#0B2545] p-6 relative shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {isAr ? 'طلب مقترح للمدرسة' : 'Request School Proposal'}
                </h3>
                <p className="text-[#D4AF37] text-sm">
                  {isAr ? 'شراكات تعليمية وتطوير الطلاب' : 'Educational Partnerships & Student Development'}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h4 className="text-xl font-bold text-[#0B2545] mb-2">
                      {isAr ? 'تم استلام طلبك!' : 'Request Received!'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {isAr 
                        ? 'سيتواصل معك فريق الشراكات قريباً لمناقشة التفاصيل.' 
                        : 'Our partnerships team will reach out to you shortly to discuss the details.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {isAr ? 'اسم المدرسة / المؤسسة' : 'School / Institution Name'}
                      </label>
                      <input 
                        type="text" 
                        name="schoolName" 
                        value={formData.schoolName} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {isAr ? 'الاسم الكامل' : 'Your Full Name'}
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B2545]">
                        {isAr ? 'المسمى الوظيفي' : 'Role / Title'}
                      </label>
                      <input 
                        type="text" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-xs font-bold text-[#0B2545]">
                          {isAr ? 'البريد الإلكتروني' : 'Email'}
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
                          {isAr ? 'رقم الهاتف' : 'Phone'}
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

                    <div className="flex items-start gap-3 mt-2">
                      <input 
                        type="checkbox" 
                        name="consent"
                        id="pdplConsentProposal"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="mt-1 shrink-0 w-4 h-4 text-[#0B2545] rounded border-gray-300 focus:ring-[#0B2545]"
                        required
                      />
                      <label htmlFor="pdplConsentProposal" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
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
                      className={`w-full mt-2 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all shadow-md ${
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
                      {status === 'submitting' ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال الطلب' : 'Submit Request')}
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
