import React from 'react';
import Link from 'next/link';
import { AlertCircle, Scale } from 'lucide-react';

const termsData = {
  header: {
    title: {
      en: "Terms & Conditions",
      ar: "الشروط والأحكام"
    },
    subtitle: {
      en: "Please read these Terms and Conditions carefully before enrolling in our programs or using our platform.",
      ar: "يرجى قراءة هذه الشروط والأحكام بعناية قبل التسجيل في برامجنا أو استخدام منصتنا."
    },
    lastUpdated: {
      en: "Last Updated: September 15, 2026",
      ar: "آخر تحديث: 15 سبتمبر 2026"
    }
  },
  disclaimer: {
    title: {
      en: "Important Legal Notice",
      ar: "إشعار قانوني هام"
    },
    text: {
      en: "By accessing our website or enrolling in any Young Leaders Academy program, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.",
      ar: "من خلال الوصول إلى موقعنا الإلكتروني أو التسجيل في أي من برامج أكاديمية القادة الشباب، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام خدماتنا."
    }
  },
  sections: [
    {
      id: "eligibility",
      num: "01",
      title: { en: "Eligibility & Enrollment", ar: "الأهلية والتسجيل" },
      content: {
        en: "Our programs are generally open to students aged 11 to 22. Applicants must provide accurate and verifiable documentation during the enrollment process. Any false information provided may result in immediate dismissal from the program without a refund.",
        ar: "برامجنا مفتوحة بشكل عام للطلاب الذين تتراوح أعمارهم بين 11 و 22 عاماً. يجب على المتقدمين تقديم وثائق دقيقة ويمكن التحقق منها أثناء عملية التسجيل. قد تؤدي أي معلومات كاذبة يتم تقديمها إلى الفصل الفوري من البرنامج دون استرداد الرسوم."
      }
    },
    {
      id: "conduct",
      num: "02",
      title: { en: "Code of Conduct", ar: "قواعد السلوك" },
      content: {
        en: "Students are expected to maintain the highest standards of professionalism, respect, and academic integrity during both online mentorship sessions and offline summer camps. Bullying, harassment, or disruptive behavior will not be tolerated and will lead to expulsion.",
        ar: "يُتوقع من الطلاب الحفاظ على أعلى معايير الاحتراف والاحترام والنزاهة الأكاديمية خلال جلسات الإرشاد عبر الإنترنت والمعسكرات الصيفية غير المتصلة بالإنترنت. لن يتم التسامح مع التنمر أو التحرش أو السلوك التخريبي وسيؤدي إلى الطرد."
      }
    },
    {
      id: "intellectual-property",
      num: "03",
      title: { en: "Intellectual Property Rights", ar: "حقوق الملكية الفكرية" },
      content: {
        en: "All curriculum materials, branding, course content, worksheets, and media provided by Young Leaders Academy remain our exclusive intellectual property. Students may not copy, distribute, or use these materials for commercial purposes without prior written consent.",
        ar: "تظل جميع مواد المناهج الدراسية والعلامات التجارية ومحتوى الدورة وأوراق العمل والوسائط المقدمة من أكاديمية القادة الشباب ملكية فكرية حصرية لنا. لا يجوز للطلاب نسخ أو توزيع أو استخدام هذه المواد لأغراض تجارية دون موافقة خطية مسبقة."
      }
    },
    {
      id: "payments",
      num: "04",
      title: { en: "Payments, Refunds & Cancellations", ar: "المدفوعات والاسترداد والإلغاء" },
      content: {
        en: "Program fees must be paid in full or via an approved installment plan before commencement. A non-refundable deposit is required to secure a spot. Cancellations made 30 days prior to the start date are eligible for a 50% refund. No refunds are issued for cancellations within 30 days.",
        ar: "يجب دفع رسوم البرنامج بالكامل أو عبر خطة تقسيط معتمدة قبل البدء. مطلوب وديعة غير قابلة للاسترداد لتأمين مكان. الإلغاءات التي تتم قبل 30 يوماً من تاريخ البدء مؤهلة لاسترداد 50٪. لا يتم إصدار أي مبالغ مستردة للإلغاءات في غضون 30 يوماً."
      }
    },
    {
      id: "governing-law",
      num: "05",
      title: { en: "Governing Law", ar: "القانون الحاكم" },
      content: {
        en: "These Terms and Conditions are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia (KSA). Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Saudi Arabia.",
        ar: "تخضع هذه الشروط والأحكام وتفسر وفقاً لقوانين المملكة العربية السعودية (KSA). تخضع أي نزاعات تنشأ بموجب هذه الشروط أو فيما يتعلق بها للاختصاص القضائي الحصري لمحاكم المملكة العربية السعودية."
      }
    }
  ]
};

export default async function TermsConditionsPage({
  params
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const isAr = locale === 'ar';

  const l = (item: { en: string; ar: string }) => isAr ? item.ar : item.en;

  return (
    <div className={`w-full min-h-screen bg-slate-50 ${isAr ? 'font-arabic' : 'font-sans'}`} dir="ltr">

      {/* Dark Navy Header Banner */}
      <section className="relative w-full bg-[#0B2545] text-white pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6 border border-[#D4AF37]/20 ">
            <Scale className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            {l(termsData.header.title)}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-4">
            {l(termsData.header.subtitle)}
          </p>
          <span className="text-sm font-medium text-gray-400">
            {l(termsData.header.lastUpdated)}
          </span>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">

          {/* Disclaimer Highlight Box */}
          <div className="bg-amber-50 border-l-4 border-[#D4AF37] p-6 md:p-8 rounded-r-2xl shadow-sm mb-12 flex gap-4 animate-fade-in-up-delay-1">
            <AlertCircle className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
            <div className="flex flex-col text-left" dir="ltr">
              <h3 className="text-lg font-bold text-amber-900 mb-2">{l(termsData.disclaimer.title)}</h3>
              <p className="text-amber-800 leading-relaxed text-sm md:text-base">
                {l(termsData.disclaimer.text)}
              </p>
            </div>
          </div>

          {/* Grid Layout for Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {termsData.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-300 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow animate-fade-in-up-delay-${Math.min(idx + 1, 4)}`}
              >
                <div className="absolute top-0 right-4 opacity-5 font-black text-8xl pointer-events-none transition-transform group-hover:scale-110">
                  {section.num}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#0B2545]/5 flex items-center justify-center text-[#0B2545] font-bold text-sm shrink-0">
                    {section.num}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#0B2545]" dir="ltr">
                    {l(section.title)}
                  </h2>
                </div>

                <p className="text-gray-600 leading-relaxed text-base relative z-10 text-left" dir="ltr">
                  {l(section.content)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center text-center bg-gray-100 rounded-3xl p-10 border border-gray-300">
            <h3 className="text-2xl font-bold text-[#0B2545] mb-4">
              {isAr ? "هل لديك أسئلة حول شروطنا؟" : "Have questions about our terms?"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg" dir="ltr">
              {isAr
                ? "إذا كان لديك أي أسئلة أو مخاوف بشأن هذه الشروط والأحكام، يرجى الاتصال بفريق الدعم القانوني لدينا."
                : "If you have any questions or concerns regarding these Terms and Conditions, please contact our legal support team."}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#0B2545] text-white font-bold hover:bg-[#1a365d] transition-colors shadow-md"
            >
              {isAr ? "اتصل بالدعم" : "Contact Support"}
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
