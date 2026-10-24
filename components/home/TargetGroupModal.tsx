"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export type TargetGroup = 'parent' | 'university' | 'school' | 'coach';

interface TargetGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroup: TargetGroup;
}

export default function TargetGroupModal({ isOpen, onClose, targetGroup }: TargetGroupModalProps) {
  const t = useTranslations("WhoWeServe");
  const tf = useTranslations("Forms");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institutionName: "",
    message: "",
    pdplConsent: false,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pdplConsent) {
      setErrorMsg(tf('pdplError'));
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGroup,
          ...formData,
          locale
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit lead');
      }

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(tf('errorMsg'));
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        institutionName: "",
        message: "",
        pdplConsent: false,
      });
      setErrorMsg("");
    }, 300);
  };

  let titleKey = "";
  let subtitleKey = "";
  let showInstitution = false;

  switch (targetGroup) {
    case 'parent':
      titleKey = "modalParentTitle";
      subtitleKey = "modalParentSubtitle";
      break;
    case 'university':
      titleKey = "modalUniversityTitle";
      subtitleKey = "modalUniversitySubtitle";
      showInstitution = true;
      break;
    case 'school':
      titleKey = "modalSchoolTitle";
      subtitleKey = "modalSchoolSubtitle";
      showInstitution = true;
      break;
    case 'coach':
      titleKey = "modalCoachTitle";
      subtitleKey = "modalCoachSubtitle";
      break;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto ${isAr ? 'font-arabic' : 'font-sans'}`} dir="ltr">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#0B2545]/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#0B2545] p-6 text-white shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold font-serif mb-1 pr-8">{t(titleKey)}</h2>
              <p className="text-white/80 text-sm">{t(subtitleKey)}</p>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B2545] mb-2">{t('modalSuccess')}</h3>
                  <p className="text-gray-600 mb-6">{t('modalSuccessDesc')}</p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 min-h-[44px] bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#133055] transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0B2545]">{tf('fullName')} *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0B2545]">{tf('email')} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      dir="ltr"
                      className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50 focus:bg-white text-start"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0B2545]">{tf('phone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      dir="ltr"
                      className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50 focus:bg-white text-start"
                    />
                  </div>

                  {showInstitution && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-[#0B2545]">{tf('institutionName')}</label>
                      <input
                        type="text"
                        name="institutionName"
                        value={formData.institutionName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-[#0B2545]">{tf('message')}</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-start mt-2">
                    <input
                      type="checkbox"
                      name="pdplConsent"
                      id={`pdplConsentModal-${targetGroup}`}
                      checked={formData.pdplConsent}
                      onChange={handleChange}
                      className="mt-1 shrink-0 w-4 h-4 text-[#0B2545] rounded border-gray-300 focus:ring-[#0B2545]"
                      required
                    />
                    <label htmlFor={`pdplConsentModal-${targetGroup}`} className="text-xs text-gray-600 leading-relaxed cursor-pointer ms-3">
                      {tf('pdplConsent')}
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs text-red-700">{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={`mt-4 w-full flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${status === 'submitting'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0B2545] hover:from-[#e3be47] hover:to-[#d6a931]'
                      }`}
                  >
                    {status === 'submitting' ? (
                      <div className="w-4 h-4 border-2 border-[#0B2545]/20 border-t-[#0B2545] rounded-full animate-spin"></div>
                    ) : null}
                    {status === 'submitting' ? tf('submitting') : tf('submitBtn')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
