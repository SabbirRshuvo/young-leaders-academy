const fs = require('fs');
const path = require('path');

const en = {
  Navigation: {
    home: "Home",
    about: "About Us",
    programs: "Programs",
    universities: "Universities",
    contact: "Contact"
  },
  Hero: {
    title: "Preparing Young People For Life.",
    subtitle: "One Academy. One Journey. A Lifetime of Impact.",
    cta: "Explore Programs"
  },
  Pillars: {
    badge: "The 7 Pillars",
    title1: "Holistic Development",
    title2: "for a Brighter",
    title3: "Future",
    desc: "We nurture every aspect of a young person's growth, helping them build the skills, character and confidence to lead a meaningful life.",
    pillars: [
      { name: "SELF", points: ["Identity", "Values", "Confidence", "Purpose", "Discipline"] },
      { name: "MIND", points: ["Critical Thinking", "AI & Technology", "Innovation", "Problem Solving", "Creativity"] },
      { name: "LEADERSHIP", points: ["Leadership", "Communication", "Influence", "Public Speaking", "Teamwork"] },
      { name: "CAREER", points: ["University Guidance", "Career Planning", "Entrepreneurship", "Internships", "Financial Literacy"] },
      { name: "HEALTH", points: ["Sports & Fitness", "Nutrition", "Mental Wellbeing", "Sleep & Recovery", "Healthy Habits"] },
      { name: "SOCIETY", points: ["Ethics & Integrity", "Community Service", "Social Intelligence", "Patriotism", "Global Awareness"] },
      { name: "FAMILY", points: ["Parent Coaching", "Teen Coaching", "Parenting Skills", "Family Communication", "Stronger Relationships"] }
    ]
  },
  WhoWeServe: {
    badge: "WHO WE SERVE",
    students_title: "Students",
    students_subtitle: "Discover your potential.",
    students_desc: "We provide students with the tools, mentorship and opportunities to build confidence, develop essential skills and achieve their dreams.",
    students_btn: "Learn More",
    parents_title: "Parents",
    parents_subtitle: "Partner in the journey.",
    parents_desc: "We support parents with expert guidance, resources and a trusted community to help their children grow and succeed.",
    parents_btn: "Learn More"
  },
  FeaturedPrograms: {
    badge: "FEATURED PROGRAMS",
    title: "Build Skills. Create Opportunities.",
    subtitle: "Our specialized programs are designed to develop future-ready leaders.",
    prog1_title: "Academic Excellence",
    prog1_desc: "Build a strong academic foundation with expert guidance, personalized support and real-world learning.",
    prog2_title: "Leadership Development",
    prog2_desc: "Develop confidence, communication and decision-making skills to become effective and compassionate leaders.",
    prog3_title: "Innovation",
    prog3_desc: "Explore creativity, technology and problem-solving to turn ideas into real-world solutions.",
    btn: "Enroll Now"
  },
  Partners: {
    badge: "OUR UNIVERSITY PARTNERS",
    title: "Top Universities. Global Opportunities.",
    subtitle: "Our partnerships with leading universities open doors to world-class education and endless possibilities."
  },
  ContactHero: {
    badge: "Get In Touch",
    title: "We'd Love to Hear From You",
    subtitle: "Have questions about our programs, university pathways, or global opportunities? Our team is here to help. Reach out and let's start your journey together."
  },
  ContactFormSection: {
    badge1: "Contact Information",
    title1: "Get in Touch",
    subtitle1: "Our team is available to assist you with any questions about our programs, admissions, or global opportunities.",
    info1_title: "Our Headquarters",
    info1_line1: "House 12, Road 5, Banani",
    info1_line2: "Dhaka 1213, Bangladesh",
    info2_title: "Phone Number",
    info2_line1: "+880 1896 123 456",
    info2_line2: "(Mon - Fri, 9:00 AM - 6:00 PM)",
    info3_title: "Email Address",
    info3_line1: "hello@youngleadersacademy.com",
    info3_line2: "(We reply within 24 hours)",
    info4_title: "Office Working Hours",
    info4_line1: "Sunday - Thursday: 9:00 AM - 6:00 PM",
    info4_line2: "Friday & Saturday: Closed",
    form_badge: "Send Us A Message",
    form_title: "We're Here to Help",
    form_name: "Full Name",
    form_name_ph: "Your full name",
    form_email: "Email Address",
    form_email_ph: "you@example.com",
    form_subject: "Subject",
    form_subject_default: "Select a subject",
    form_subject_opt1: "Admissions & Enrollment",
    form_subject_opt2: "Program Details",
    form_subject_opt3: "University Partnerships",
    form_subject_opt4: "Other Inquiry",
    form_message: "Message",
    form_message_ph: "Tell us how we can help you...",
    form_submit: "Send Message",
    form_footer: "Your information is safe with us."
  },
  ContactCta: {
    badge: "Stay Connected",
    title: "Join Our Global Community",
    subtitle: "Get the latest updates on programs, university pathways, and leadership opportunities.",
    input_ph: "Your email address"
  },
  GlobalPresence: {
    badge: "Our Global Presence",
    title: "A Worldwide Network",
    subtitle: "From our headquarters to our international partners, we are connected across the globe to bring world-class opportunities closer to you.",
    stat1_val: "6",
    stat1_lbl: "Continents",
    stat2_val: "20+",
    stat2_lbl: "Countries",
    stat3_val: "50+",
    stat3_lbl: "Partner Institutions",
    loc1_city: "Dhaka",
    loc1_desc: "Headquarters",
    loc2_city: "London",
    loc2_desc: "Europe Office",
    loc3_city: "New York",
    loc3_desc: "Regional Office",
    loc4_city: "Singapore",
    loc4_desc: "Asia Pacific Office"
  }
};

const ar = {
  Navigation: {
    home: "الرئيسية",
    about: "من نحن",
    programs: "البرامج",
    universities: "الجامعات",
    contact: "اتصل بنا"
  },
  Hero: {
    title: "إعداد الشباب للحياة.",
    subtitle: "أكاديمية واحدة. رحلة واحدة. أثر يدوم مدى الحياة.",
    cta: "استكشف البرامج"
  },
  Pillars: {
    badge: "الركائز السبع",
    title1: "التنمية الشاملة",
    title2: "من أجل مستقبل",
    title3: "أكثر إشراقاً",
    desc: "نحن نرعى كل جانب من جوانب نمو الشباب، ونساعدهم على بناء المهارات والشخصية والثقة لعيش حياة هادفة.",
    pillars: [
      { name: "الذات", points: ["الهوية", "القيم", "الثقة بالنفس", "الغاية", "الانضباط"] },
      { name: "العقل", points: ["التفكير النقدي", "الذكاء الاصطناعي والتكنولوجيا", "الابتكار", "حل المشكلات", "الإبداع"] },
      { name: "القيادة", points: ["القيادة", "التواصل", "التأثير", "الخطابة", "العمل الجماعي"] },
      { name: "المسيرة المهنية", points: ["التوجيه الجامعي", "التخطيط المهني", "ريادة الأعمال", "التدريب العملي", "محو الأمية المالية"] },
      { name: "الصحة", points: ["الرياضة واللياقة البدنية", "التغذية", "الصحة النفسية", "النوم والتعافي", "العادات الصحية"] },
      { name: "المجتمع", points: ["الأخلاق والنزاهة", "خدمة المجتمع", "الذكاء الاجتماعي", "الوطنية", "الوعي العالمي"] },
      { name: "الأسرة", points: ["توجيه الآباء", "توجيه المراهقين", "مهارات التربية", "التواصل الأسري", "علاقات أقوى"] }
    ]
  },
  WhoWeServe: {
    badge: "من نخدم",
    students_title: "الطلاب",
    students_subtitle: "اكتشف إمكانياتك.",
    students_desc: "نحن نزود الطلاب بالأدوات والتوجيه والفرص لبناء الثقة وتطوير المهارات الأساسية وتحقيق أحلامهم.",
    students_btn: "اكتشف المزيد",
    parents_title: "الآباء",
    parents_subtitle: "شركاء في الرحلة.",
    parents_desc: "نحن ندعم الآباء بالتوجيه المتخصص والموارد والمجتمع الموثوق لمساعدة أطفالهم على النمو والنجاح.",
    parents_btn: "اكتشف المزيد"
  },
  FeaturedPrograms: {
    badge: "البرامج المميزة",
    title: "بناء المهارات. خلق الفرص.",
    subtitle: "تم تصميم برامجنا المتخصصة لإعداد قادة المستقبل.",
    prog1_title: "التميز الأكاديمي",
    prog1_desc: "بناء أساس أكاديمي قوي من خلال التوجيه الخبير والدعم المخصص والتعلم الواقعي.",
    prog2_title: "تطوير القيادة",
    prog2_desc: "تنمية الثقة ومهارات التواصل واتخاذ القرار لإعداد قادة فاعلين وعطوفين.",
    prog3_title: "الابتكار",
    prog3_desc: "استكشاف الإبداع والتكنولوجيا وحل المشكلات لتحويل الأفكار إلى حلول واقعية.",
    btn: "سجل الآن"
  },
  Partners: {
    badge: "شركاؤنا من الجامعات",
    title: "أفضل الجامعات. فرص عالمية.",
    subtitle: "شراكاتنا مع الجامعات الرائدة تفتح أبواباً لتعليم بمستوى عالمي وفرص لا حصر لها."
  },
  ContactHero: {
    badge: "تواصل معنا",
    title: "يسعدنا أن نسمع منك",
    subtitle: "هل لديك أسئلة حول برامجنا أو المسارات الجامعية أو الفرص العالمية؟ فريقنا هنا للمساعدة. تواصل معنا لنبدأ رحلتك معاً."
  },
  ContactFormSection: {
    badge1: "معلومات الاتصال",
    title1: "تواصل معنا",
    subtitle1: "فريقنا متاح لمساعدتك في أي أسئلة حول برامجنا أو القبول أو الفرص العالمية.",
    info1_title: "مقرنا الرئيسي",
    info1_line1: "House 12, Road 5, Banani",
    info1_line2: "Dhaka 1213, Bangladesh",
    info2_title: "رقم الهاتف",
    info2_line1: "+880 1896 123 456",
    info2_line2: "(الاثنين - الجمعة، 9:00 صباحاً - 6:00 مساءً)",
    info3_title: "البريد الإلكتروني",
    info3_line1: "hello@youngleadersacademy.com",
    info3_line2: "(نرد خلال 24 ساعة)",
    info4_title: "ساعات عمل المكتب",
    info4_line1: "الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً",
    info4_line2: "الجمعة والسبت: مغلق",
    form_badge: "أرسل لنا رسالة",
    form_title: "نحن هنا للمساعدة",
    form_name: "الاسم الكامل",
    form_name_ph: "اسمك الكامل",
    form_email: "البريد الإلكتروني",
    form_email_ph: "you@example.com",
    form_subject: "الموضوع",
    form_subject_default: "اختر موضوعاً",
    form_subject_opt1: "القبول والتسجيل",
    form_subject_opt2: "تفاصيل البرنامج",
    form_subject_opt3: "الشراكات الجامعية",
    form_subject_opt4: "استفسار آخر",
    form_message: "الرسالة",
    form_message_ph: "أخبرنا كيف يمكننا مساعدتك...",
    form_submit: "إرسال الرسالة",
    form_footer: "معلوماتك آمنة معنا."
  },
  ContactCta: {
    badge: "ابق على تواصل",
    title: "انضم إلى مجتمعنا العالمي",
    subtitle: "احصل على آخر التحديثات حول البرامج والمسارات الجامعية وفرص القيادة.",
    input_ph: "عنوان بريدك الإلكتروني"
  },
  GlobalPresence: {
    badge: "حضورنا العالمي",
    title: "شبكة عالمية",
    subtitle: "من مقرنا الرئيسي إلى شركائنا الدوليين، نحن متصلون في جميع أنحاء العالم لتقريب الفرص العالمية منك.",
    stat1_val: "6",
    stat1_lbl: "قارات",
    stat2_val: "20+",
    stat2_lbl: "دولة",
    stat3_val: "50+",
    stat3_lbl: "مؤسسة شريكة",
    loc1_city: "Dhaka",
    loc1_desc: "المقر الرئيسي",
    loc2_city: "London",
    loc2_desc: "مكتب أوروبا",
    loc3_city: "New York",
    loc3_desc: "المكتب الإقليمي",
    loc4_city: "Singapore",
    loc4_desc: "مكتب آسيا والمحيط الهادئ"
  }
};

fs.writeFileSync('messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('messages/ar.json', JSON.stringify(ar, null, 2));

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useTranslations')) {
    content = content.replace(/(import .* from 'lucide-react';|import .* from 'framer-motion';|import .* from 'next\/image';|import .* from 'next\/link';)/, "$1\nimport { useTranslations } from 'next-intl';");
  }

  for (const [search, replace] of replacements) {
    if (typeof search === 'string') {
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }

  // Insert hook inside the component
  const componentMatch = content.match(/export default function ([A-Za-z0-9_]+)\([^)]*\) {\n/);
  if (componentMatch && !content.includes('const t = useTranslations')) {
    const compName = componentMatch[1];
    let namespace = compName;
    content = content.replace(componentMatch[0], componentMatch[0] + `  const t = useTranslations('${namespace}');\n`);
  }

  fs.writeFileSync(filePath, content);
}

replaceInFile('components/home/Hero.tsx', [
  ['Preparing Young<br />People For Life.', "{t('title').split(' ').slice(0, 2).join(' ')}<br />{t('title').split(' ').slice(2).join(' ')}"],
  ['One Academy. One Journey.<br />A Lifetime of Impact.', "{t('subtitle')}"],
  ['Explore Programs', "{t('cta')}"]
]);

// Pillars has a static array outside. We need to move it inside.
let pillarsContent = fs.readFileSync('components/home/Pillars.tsx', 'utf8');
if (!pillarsContent.includes('useTranslations')) {
  pillarsContent = pillarsContent.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useTranslations } from 'next-intl';");
  
  // Extract pillars array and put it inside the component
  const arrayRegex = /const pillars = \[\s*([\s\S]*?)\s*\];/;
  pillarsContent = pillarsContent.replace(arrayRegex, "");
  
  const compRegex = /export default function Pillars\(\) {/;
  pillarsContent = pillarsContent.replace(compRegex, `export default function Pillars() {
  const t = useTranslations('Pillars');
  const pillars = [
    { name: t('pillars.0.name'), icon: UserRound, points: [t('pillars.0.points.0'), t('pillars.0.points.1'), t('pillars.0.points.2'), t('pillars.0.points.3'), t('pillars.0.points.4')] },
    { name: t('pillars.1.name'), icon: Brain, points: [t('pillars.1.points.0'), t('pillars.1.points.1'), t('pillars.1.points.2'), t('pillars.1.points.3'), t('pillars.1.points.4')] },
    { name: t('pillars.2.name'), icon: Flag, points: [t('pillars.2.points.0'), t('pillars.2.points.1'), t('pillars.2.points.2'), t('pillars.2.points.3'), t('pillars.2.points.4')] },
    { name: t('pillars.3.name'), icon: BriefcaseBusiness, points: [t('pillars.3.points.0'), t('pillars.3.points.1'), t('pillars.3.points.2'), t('pillars.3.points.3'), t('pillars.3.points.4')] },
    { name: t('pillars.4.name'), icon: HeartPulse, points: [t('pillars.4.points.0'), t('pillars.4.points.1'), t('pillars.4.points.2'), t('pillars.4.points.3'), t('pillars.4.points.4')] },
    { name: t('pillars.5.name'), icon: Globe2, points: [t('pillars.5.points.0'), t('pillars.5.points.1'), t('pillars.5.points.2'), t('pillars.5.points.3'), t('pillars.5.points.4')] },
    { name: t('pillars.6.name'), icon: UsersRound, points: [t('pillars.6.points.0'), t('pillars.6.points.1'), t('pillars.6.points.2'), t('pillars.6.points.3'), t('pillars.6.points.4')] },
  ];
`);

  pillarsContent = pillarsContent.replace('The 7 Pillars', "{t('badge')}");
  pillarsContent = pillarsContent.replace('Holistic Development', "{t('title1')}");
  pillarsContent = pillarsContent.replace('for a Brighter', "{t('title2')}");
  pillarsContent = pillarsContent.replace('Future', "{t('title3')}");
  pillarsContent = pillarsContent.replace("We nurture every aspect of a young person's growth, helping them build\n            the skills, character and confidence to lead a meaningful life.", "{t('desc')}");
  
  fs.writeFileSync('components/home/Pillars.tsx', pillarsContent);
}

replaceInFile('components/home/WhoWeServe.tsx', [
  ['WHO WE SERVE', "{t('badge')}"],
  ['>Students<', ">{t('students_title')}<"],
  ['Discover your potential.', "{t('students_subtitle')}"],
  ['We provide students with the tools, mentorship and opportunities to build confidence, develop essential skills and achieve their dreams.', "{t('students_desc')}"],
  ['Learn More <ArrowRight', "{t('students_btn')} <ArrowRight"],
  ['>Parents<', ">{t('parents_title')}<"],
  ['Partner in the journey.', "{t('parents_subtitle')}"],
  ['We support parents with expert guidance, resources and a trusted community to help their children grow and succeed.', "{t('parents_desc')}"],
  ['Learn More <ArrowRight', "{t('parents_btn')} <ArrowRight"]
]);

let featuredContent = fs.readFileSync('components/home/FeaturedPrograms.tsx', 'utf8');
if (!featuredContent.includes('useTranslations')) {
  featuredContent = featuredContent.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useTranslations } from 'next-intl';");
  
  const arrayRegex = /const programs = \[\s*([\s\S]*?)\s*\];/;
  featuredContent = featuredContent.replace(arrayRegex, "");
  
  const compRegex = /export default function FeaturedPrograms\(\) {/;
  featuredContent = featuredContent.replace(compRegex, `export default function FeaturedPrograms() {
  const t = useTranslations('FeaturedPrograms');
  const programs = [
    { title: t('prog1_title'), desc: t('prog1_desc'), icon: GraduationCap, image: '/card1.png' },
    { title: t('prog2_title'), desc: t('prog2_desc'), icon: Users, image: '/card2.png' },
    { title: t('prog3_title'), desc: t('prog3_desc'), icon: Lightbulb, image: '/card3.png' }
  ];
`);

  featuredContent = featuredContent.replace('FEATURED PROGRAMS', "{t('badge')}");
  featuredContent = featuredContent.replace('Build Skills. Create Opportunities.', "{t('title')}");
  featuredContent = featuredContent.replace('Our specialized programs are designed to develop future-ready leaders.', "{t('subtitle')}");
  featuredContent = featuredContent.replace('Enroll Now\n                      <ArrowRight', "{t('btn')}\n                      <ArrowRight");

  fs.writeFileSync('components/home/FeaturedPrograms.tsx', featuredContent);
}

replaceInFile('components/home/Partners.tsx', [
  ['OUR UNIVERSITY PARTNERS', "{t('badge')}"],
  ['Top Universities. Global Opportunities.', "{t('title')}"],
  ['Our partnerships with leading universities open doors to world-class education and endless possibilities.', "{t('subtitle')}"]
]);

replaceInFile('components/contact/ContactHero.tsx', [
  ['Get In Touch', "{t('badge')}"],
  ["We'd Love to Hear<br />From You", "{t('title')}"],
  ["Have questions about our programs, university pathways, or global opportunities? Our team is here to help. Reach out and let's start your journey together.", "{t('subtitle')}"]
]);

replaceInFile('components/contact/ContactCta.tsx', [
  ['Stay Connected', "{t('badge')}"],
  ['Join Our Global Community', "{t('title')}"],
  ['Get the latest updates on programs, university pathways, and leadership opportunities.', "{t('subtitle')}"],
  ['placeholder="Your email address"', "placeholder={t('input_ph')}"]
]);

let globalContent = fs.readFileSync('components/contact/GlobalPresence.tsx', 'utf8');
if (!globalContent.includes('useTranslations')) {
  globalContent = globalContent.replace("import { MapPin } from 'lucide-react';", "import { MapPin } from 'lucide-react';\nimport { useTranslations } from 'next-intl';");
  
  const arrayRegex = /const locations = \[\s*([\s\S]*?)\s*\];/;
  globalContent = globalContent.replace(arrayRegex, "");
  
  const compRegex = /export default function GlobalPresence\(\) {/;
  globalContent = globalContent.replace(compRegex, `export default function GlobalPresence() {
  const t = useTranslations('GlobalPresence');
  const locations = [
    { city: t('loc1_city'), desc: t('loc1_desc') },
    { city: t('loc2_city'), desc: t('loc2_desc') },
    { city: t('loc3_city'), desc: t('loc3_desc') },
    { city: t('loc4_city'), desc: t('loc4_desc') }
  ];
`);

  globalContent = globalContent.replace('Our Global Presence', "{t('badge')}");
  globalContent = globalContent.replace('A Worldwide Network', "{t('title')}");
  globalContent = globalContent.replace('From our headquarters to our international partners, we are connected across the globe to bring world-class opportunities closer to you.', "{t('subtitle')}");
  globalContent = globalContent.replace('>6<', ">{t('stat1_val')}<");
  globalContent = globalContent.replace('>Continents<', ">{t('stat1_lbl')}<");
  globalContent = globalContent.replace('>20+<', ">{t('stat2_val')}<");
  globalContent = globalContent.replace('>Countries<', ">{t('stat2_lbl')}<");
  globalContent = globalContent.replace('>50+<', ">{t('stat3_val')}<");
  globalContent = globalContent.replace('>Partner Institutions<', ">{t('stat3_lbl')}<");

  fs.writeFileSync('components/contact/GlobalPresence.tsx', globalContent);
}

let formContent = fs.readFileSync('components/contact/ContactFormSection.tsx', 'utf8');
if (!formContent.includes('useTranslations')) {
  formContent = formContent.replace("import { MapPin, Phone, Mail, Clock, Lock, ArrowRight } from 'lucide-react';", "import { MapPin, Phone, Mail, Clock, Lock, ArrowRight } from 'lucide-react';\nimport { useTranslations } from 'next-intl';");
  
  const arrayRegex = /const contactInfo = \[\s*([\s\S]*?)\s*\];/;
  formContent = formContent.replace(arrayRegex, "");
  
  const compRegex = /export default function ContactFormSection\(\) {/;
  formContent = formContent.replace(compRegex, `export default function ContactFormSection() {
  const t = useTranslations('ContactFormSection');
  const contactInfo = [
    { icon: MapPin, title: t('info1_title'), details: [t('info1_line1'), t('info1_line2')], link: null },
    { icon: Phone, title: t('info2_title'), details: [t('info2_line1'), t('info2_line2')], link: "tel:+8801896123456" },
    { icon: Mail, title: t('info3_title'), details: [t('info3_line1'), t('info3_line2')], link: "mailto:hello@youngleadersacademy.com" },
    { icon: Clock, title: t('info4_title'), details: [t('info4_line1'), t('info4_line2')], link: null }
  ];
`);

  formContent = formContent.replace('Contact Information', "{t('badge1')}");
  formContent = formContent.replace('>Get in Touch<', ">{t('title1')}<");
  formContent = formContent.replace('Our team is available to assist you with any questions about our programs, admissions, or global opportunities.', "{t('subtitle1')}");
  formContent = formContent.replace('Send Us A Message', "{t('form_badge')}");
  formContent = formContent.replace("We're Here to Help", "{t('form_title')}");
  formContent = formContent.replace('>Full Name <', ">{t('form_name')} <");
  formContent = formContent.replace('placeholder="Your full name"', "placeholder={t('form_name_ph')}");
  formContent = formContent.replace('>Email Address <', ">{t('form_email')} <");
  formContent = formContent.replace('placeholder="you@example.com"', "placeholder={t('form_email_ph')}");
  formContent = formContent.replace('>Subject <', ">{t('form_subject')} <");
  formContent = formContent.replace('Select a subject', "{t('form_subject_default')}");
  formContent = formContent.replace('Admissions & Enrollment', "{t('form_subject_opt1')}");
  formContent = formContent.replace('>Program Details<', ">{t('form_subject_opt2')}<");
  formContent = formContent.replace('University Partnerships', "{t('form_subject_opt3')}");
  formContent = formContent.replace('Other Inquiry', "{t('form_subject_opt4')}");
  formContent = formContent.replace('>Message <', ">{t('form_message')} <");
  formContent = formContent.replace('placeholder="Tell us how we can help you..."', "placeholder={t('form_message_ph')}");
  formContent = formContent.replace('Send Message', "{t('form_submit')}");
  formContent = formContent.replace('Your information is safe with us.', "{t('form_footer')}");

  fs.writeFileSync('components/contact/ContactFormSection.tsx', formContent);
}

console.log('All files updated successfully');
