import { getTranslations } from 'next-intl/server';
import FaqAccordion from '@/components/faq/FaqAccordion';

export default async function FaqPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const isAr = locale === 'ar';

  const t = await getTranslations('FaqPage');

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];

  return (
    <div className={`w-full min-h-screen bg-slate-50 py-16 md:py-24 ${isAr ? 'font-arabic' : 'font-sans'}`} dir="ltr">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Page Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-4 border border-[#D4AF37]/20">
            {t('badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B2545] mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-lg max-w-xl">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <FaqAccordion key={idx} question={faq.q} answer={faq.a} />
          ))}
        </div>

      </div>
    </div>
  );
}
