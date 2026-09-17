import React from 'react';
import Link from 'next/link';

const privacyData = {
  header: {
    title: {
      en: "Privacy Policy",
      ar: "سياسة الخصوصية"
    },
    subtitle: {
      en: "How we collect, use, and protect your personal data in strict compliance with the Saudi Arabia PDPL and National Data Governance policies.",
      ar: "كيف نقوم بجمع واستخدام وحماية بياناتك الشخصية في امتثال صارم لنظام حماية البيانات الشخصية (PDPL) في المملكة العربية السعودية وسياسات حوكمة البيانات الوطنية."
    },
    lastUpdated: {
      en: "Last Updated: September 15, 2026",
      ar: "آخر تحديث: 15 سبتمبر 2026"
    }
  },
  sections: [
    {
      id: "introduction",
      title: { en: "1. Introduction & Compliance", ar: "1. المقدمة والامتثال" },
      content: {
        en: "Young Leaders Academy (\"we\", \"our\", or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, process, and protect your personal data in strict compliance with the Saudi Arabia Personal Data Protection Law (PDPL) and National Data Governance policies.",
        ar: "تلتزم أكاديمية القادة الشباب (\"نحن\" أو \"الخاص بنا\" أو \"إلينا\") بحماية خصوصيتك. تشرح سياسة الخصوصية هذه كيف نقوم بجمع ومعالجة وحماية بياناتك الشخصية في امتثال صارم لنظام حماية البيانات الشخصية (PDPL) في المملكة العربية السعودية وسياسات حوكمة البيانات الوطنية."
      }
    },
    {
      id: "data-collection",
      title: { en: "2. Data Collection", ar: "2. جمع البيانات" },
      content: {
        en: "We collect specific personal information necessary for program enrollment and educational purposes. This includes: Full Name, Email Address, Phone Number, Date of Birth/Age, Academic Records, and Payment Details.",
        ar: "نقوم بجمع معلومات شخصية محددة ضرورية للتسجيل في البرنامج وللأغراض التعليمية. يشمل ذلك: الاسم الكامل، وعنوان البريد الإلكتروني، ورقم الهاتف، وتاريخ الميلاد/العمر، والسجلات الأكاديمية، وتفاصيل الدفع."
      }
    },
    {
      id: "minors",
      title: { en: "3. Protection of Minors", ar: "3. حماية القصر" },
      content: {
        en: "As an educational academy serving students, we take the privacy of minors (under 18 years old) very seriously. We require explicit, verifiable consent from a parent or legal guardian before collecting, using, or processing any personal data of a minor for program enrollment.",
        ar: "بصفتنا أكاديمية تعليمية تخدم الطلاب، فإننا نأخذ خصوصية القصر (أقل من 18 عاماً) على محمل الجد. نطلب موافقة صريحة ويمكن التحقق منها من الوالد أو الوصي القانوني قبل جمع أو استخدام أو معالجة أي بيانات شخصية لقاصر لغرض التسجيل في البرنامج."
      }
    },
    {
      id: "data-usage",
      title: { en: "4. Data Usage & Sharing", ar: "4. استخدام البيانات ومشاركتها" },
      content: {
        en: "Your personal data is strictly used for educational delivery, admissions, and communication. We NEVER sell your data to third parties. Data is only shared with verified partner universities and institutions strictly for your admission, scholarships, or program progression, with your explicit consent.",
        ar: "تُستخدم بياناتك الشخصية بشكل صارم لتقديم الخدمات التعليمية والقبول والتواصل. نحن لا نبيع بياناتك لأطراف ثالثة أبداً. تتم مشاركة البيانات فقط مع الجامعات والمؤسسات الشريكة المعتمدة بشكل صارم لأغراض القبول أو المنح الدراسية أو التقدم في البرنامج، وذلك بموافقتك الصريحة."
      }
    },
    {
      id: "user-rights",
      title: { en: "5. User Rights under PDPL", ar: "5. حقوق المستخدم بموجب نظام حماية البيانات الشخصية" },
      content: {
        en: "Under the Saudi PDPL, you have the right to: 1) Be informed about how your data is used. 2) Access your personal data. 3) Request correction of inaccurate data. 4) Request destruction/deletion of your data when no longer needed. 5) Withdraw your consent at any time.",
        ar: "بموجب نظام حماية البيانات الشخصية السعودي، يحق لك: 1) العلم بكيفية استخدام بياناتك. 2) الوصول إلى بياناتك الشخصية. 3) طلب تصحيح البيانات غير الدقيقة. 4) طلب إتلاف/حذف بياناتك عندما لا تعود هناك حاجة إليها. 5) سحب موافقتك في أي وقت."
      }
    }
  ]
};

export default async function PrivacyPolicyPage({
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
      <section className="relative w-full bg-slate-900 text-white pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
        <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col animate-fade-in-up ${isAr ? 'items-end text-right' : ''}`}>
          <div className="inline-flex w-max px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6">
            {l(privacyData.header.title)}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            {l(privacyData.header.title)}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-4" dir={isAr ? 'rtl' : 'ltr'}>
            {l(privacyData.header.subtitle)}
          </p>
          <span className="text-sm font-medium text-gray-400" dir={isAr ? 'rtl' : 'ltr'}>
            {l(privacyData.header.lastUpdated)}
          </span>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12 items-start relative">

            {/* Sticky Table of Contents (Sidebar) */}
            <aside className="w-full lg:w-1/3 lg:sticky lg:top-28 animate-fade-in-up-delay-1">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                <h3 className={`text-xl font-bold text-[#0B2545] mb-6 pb-4 border-b border-gray-100 ${isAr ? 'text-right' : ''}`}>
                  {isAr ? "جدول المحتويات" : "Table of Contents"}
                </h3>
                <nav className="flex flex-col gap-3">
                  {privacyData.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`text-gray-600 hover:text-[#D4AF37] transition-colors font-medium text-sm md:text-base flex items-center group ${isAr ? 'flex-row-reverse justify-start' : ''}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#D4AF37] transition-colors ${isAr ? 'ml-3' : 'mr-3'}`}></span>
                      <span dir={isAr ? 'rtl' : 'ltr'}>{l(section.title)}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content Cards */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
              {privacyData.sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={section.id}
                  className={`bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200 scroll-mt-28 animate-fade-in-up-delay-${Math.min(idx + 1, 4)}`}
                >
                  <h2 className={`text-2xl md:text-3xl font-bold text-[#0B2545] mb-6 ${isAr ? 'text-right' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
                    {l(section.title)}
                  </h2>
                  <div className={`prose prose-lg max-w-none text-gray-600 leading-relaxed ${isAr ? 'text-right' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
                    <p>{l(section.content)}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
